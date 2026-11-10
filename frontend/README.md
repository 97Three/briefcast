# Briefcast · 会前 30 天研究简报（前端）

面向小团队会前准备的研究工作台：填写研究对象与会议时间，得到一页可带进会议的简报，清楚回答三件事——**最近 30 天发生了什么 → 对这次会议可能意味着什么 → 会上值得问什么**。

前端只负责呈现与交互，所有检索、核验和推断均由现有 Python 后端完成。

---

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript（严格模式） |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3（自定义色板 + 打印样式） |
| 路由 | Vue Router 4 |
| 状态 | Composables（模块级单例），不引入状态管理库 |
| 图标 | 内联 SVG，无额外图标依赖 |

运行时依赖只有 `vue` 与 `vue-router`。

页面右上角可切换中文与英文。选择会保存在浏览器中，并作为新建简报的默认正文语言。界面、演示数据、来源说明、复制文本和打印版都会切换；已经生成的研究正文及原文引述保持生成时的语言，如需另一种正文语言请重新生成。无需在浏览器填写 API 密钥。

---

## 启动

### 1. 先起后端

在项目根目录：

```powershell
.\.venv\Scripts\python.exe -m uvicorn sourcebound.api:app --reload
```

后端监听 `http://127.0.0.1:8000`，交互文档在 `/docs`。
DeepSeek 与 Tavily 的密钥只写在项目根目录 `.env`，**不会进入前端**。

### 2. 再起前端

```powershell
cd frontend
npm install
npm run dev
```

打开 `http://localhost:5173`。Vite 已把 `/api` 代理到 `http://127.0.0.1:8000`。

### 3. 其他脚本

```powershell
npm run build     # 类型检查 + 生产构建，产物在 frontend/dist
npm run preview   # 本地预览生产构建
```

---

## 页面与状态

| 路由 | 内容 |
| --- | --- |
| `/` | 输入页：研究对象、会议时间、会议目的；补充信息默认折叠 |
| `/briefing` | 结果页：生成进度 → 简报 / 空状态 / 错误 |
| `/briefing?demo=completed\|partial\|insufficient\|error` | 演示态，可直接分享 |
| `/briefing?demo=completed&paper=1` | 打印预览（A4 纸张版式） |

结果页包含：简报头（会议时间、研究窗口、生成时间、状态）、研究局限、动态时间线、建议问题、信息来源、处理统计。
点击引文 `[S1]` 或日期标签会打开来源侧栏，显示**原文摘录、来源标题、发布日期、检索时间、检索式、搜索摘要（明确标注非原文引述）与原网页链接**。

---

## 目录结构

```
frontend/
├─ src/
│  ├─ api/client.ts            # POST /api/briefing/stream 的 fetch + ReadableStream SSE 解析
│  ├─ types/index.ts           # 与后端契约一致的类型（唯一数据源）
│  ├─ composables/
│  │  ├─ useBriefing.ts        # 请求、SSE 进度、结果与错误；模块级单例 + 真实事件流
│  │  ├─ useDemoMode.ts        # 演示态（支持 URL 深链接）
│  │  ├─ useHealth.ts          # GET /api/health → 顶部就绪指示
│  │  ├─ useLocale.ts          # 中/英界面语言
│  │  ├─ useCommandPalette.ts  # ⌘K 命令面板状态与动作类型
│  │  ├─ usePointerSpotlight.ts# 指针光斑（精确指针 + 非减弱动效才启用）
│  │  ├─ useViewTransition.ts  # View Transitions 能力探测与导航包装
│  │  └─ useCountUp.ts         # 数字滚动
│  ├─ directives/reveal.ts     # v-reveal 滚动入场（含首屏直显与兜底）
│  ├─ components/
│  │  ├─ AppHeader.vue         # 品牌、语言切换、⌘K 入口、后端就绪状态
│  │  ├─ ProgressDisplay.vue   # plan→search→assess→draft→verify→compose 真实进度 + 雷达扫描
│  │  ├─ LiveEventLog.vue      # 把真实 SSE 事件渲染成终端式日志（含真实耗时）
│  │  ├─ BriefingResult.vue    # 屏幕版简报（J/K 导航、引文预览、章节轨）
│  │  ├─ SourcePanel.vue       # 来源侧栏
│  │  ├─ CitationPreview.vue   # 引文悬停预览卡
│  │  ├─ ReadingRail.vue       # 右侧阅读进度与章节索引
│  │  ├─ CommandPalette.vue    # ⌘K / Ctrl K 命令面板
│  │  ├─ CountNumber.vue       # 统计数字滚动
│  │  ├─ PrintBriefing.vue     # 打印专用一页版式
│  │  ├─ PaperPreview.vue      # 打印预览（A4）
│  │  ├─ ErrorDisplay.vue      # 错误 / 流中断
│  │  └─ EmptyState.vue
│  ├─ views/
│  │  ├─ InputView.vue
│  │  └─ BriefingView.vue
│  ├─ demo/                    # 虚构演示数据（completed / partial / insufficient）
│  ├─ lib/
│  │  ├─ sourceType.ts         # 来源类型与日期基准的文案定义（语义集中处）
│  │  ├─ format.ts             # 日期格式化（兼容纯日期与完整 ISO 时间戳）
│  │  └─ briefText.ts          # 纯文本导出（结果页与命令面板共用）
│  └─ styles/main.css          # 主题、装饰、无障碍与 @media print
└─ vite.config.ts              # /api → 127.0.0.1:8000
```

---

## 交互速查

| 操作 | 行为 |
| --- | --- |
| `⌘K` / `Ctrl K` | 打开命令面板：返回输入、复制简报、打印预览、打印、切换演示态、切换语言 |
| `↑` `↓` `↵` `Esc` | 命令面板内选择 / 执行 / 关闭 |
| `J` / `K` | 在已核实动态之间上下移动（结果页，且焦点不在输入框内） |
| `Enter` | 打开当前选中动态的第一条来源 |
| `Esc` | 关闭来源侧栏 / 引文预览 |
| 悬停引文 `[S1]` | 桌面端浮出原文摘录预览卡；点击仍打开完整侧栏 |
| 右侧细轨与圆点 | 阅读进度与章节索引（`xl` 以上显示），点击可跳转 |

所有这些都有降级：触屏不启用悬停预览与指针光斑；移动端隐藏章节轨；打印版完全不出现。

---

## 接口用法

- **主流程**：`POST /api/briefing/stream`，`fetch()` 读取 SSE。`EventSource` 只支持 GET，因此不使用。
  解析逻辑在 `src/api/client.ts`：按行缓冲，处理分块边界，识别 `progress` / `result` / `error` 三种事件。
- **调试**：`POST /api/briefing` 用同一请求体直接拿最终 JSON（未接入主流程，便于排查）。
- **健康检查**：`GET /api/health` 只返回是否配置，不返回密钥。

错误处理：

| 情况 | 表现 |
| --- | --- |
| HTTP 422 | 提示检查会议时间是否带时区 |
| HTTP 503 | 提示后端未配置密钥 |
| HTTP 502 / SSE `error` | 中断页 + 返回重试 |
| 流提前结束且无结果 | 视为连接中断，提示重试 |

会议时间必须带时区：输入框用 `datetime-local`，提交前按浏览器时区补 `+HH:MM`。

---

## 数据语义（前端严格遵守）

| 字段 | 界面处理 |
| --- | --- |
| `date_basis=source_publication` | 只标「来源发布日期」，不称为事件发生日 |
| `date_basis=explicit_event_date` | 标「事件日期」，可点开查看 `date_evidence` 原句 |
| `sources[].snippet` | 标「搜索摘要 · 非原文引述」 |
| `citations[].quote` | 标「原文摘录」，说明已与正文精确匹配 |
| `meeting_implication` | 独立紫色区块，标「会议推断」，与事实分开 |
| `research_stats` | 标「处理统计」，注明不是可信度评分 |
| `source_type=official` | 标「官方域名」，提示仅表示网址匹配，不代表独立证实 |
| `development_ids` | 仅用于点击定位，不进入任何界面文案 |

---

## 设计与动画约束

- 深色底（`#0a0e1a`）+ 青蓝主色（`#0ea5e9`）+ 低饱和紫（`#8b5cf6`），高对比、少亮色。
- 光影分三层，全部在内容之下：环境光球（低频漂移）→ 指针光斑（跟随鼠标，`rAF` 合并）→ 1px 胶片颗粒（去渐变塑料感，`opacity: .035`）。
- 入场用 `v-reveal`：`IntersectionObserver` 触发，只改 `opacity` / `transform`，按序号 `55ms` 交错；首屏元素直接入场，另有 2 秒兜底，避免任何情况下内容不可见。
- 数字滚动（`CountNumber`）只改文本，不改布局；`prefers-reduced-motion` 时直接给终值。
- 当前阶段的脉冲升级为 `conic-gradient` + `mask` 的雷达扫描，仅旋转 `transform`。
- 尊重 `prefers-reduced-motion`；移动端关闭光斑、扫描线与章节轨，缩短交错延时。
- 页面转场用 View Transitions API，仅做 `opacity` 过渡，不支持时静默降级。

## 打印

`PrintBriefing.vue` 是独立的一页 A4 版式（不是把屏幕版硬压）：左栏动态，右栏问题与来源，来源带**完整 URL**。
验证方式：`/briefing?demo=completed&paper=1` 查看预览；`npm run build` 后浏览器打印应落在 1 页内（已用 `--print-to-pdf` 验证页数）。

打印时所有装饰层、章节轨、命令面板、悬停预览一律不出现；`.reveal` 元素由打印样式强制 `opacity: 1`。

## 命令面板

`⌘K` / `Ctrl K` 打开，动作来自 `App.vue` 的 `paletteActions`，按组呈现（导航 / 输出 / 演示数据 / 界面）。
面板只调用已有能力（路由跳转、复制、打印、切语言、切演示态），不引入新的数据通道。

## 部署

生产构建为静态文件。把 `dist/` 交给静态服务器，并把 `/api` 反代到后端：

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_buffering off;   # SSE 需要
}
```

如需前后端分域部署，用**公开**变量指定 API 基址（只能放地址，不能放密钥）：

```
VITE_API_BASE_URL=https://api.example.com
```

## 安全边界

- 前端代码、构建产物、浏览器请求里都不出现 DeepSeek / Tavily 密钥。
- 搜索与推理全部由后端调用；浏览器只与本项目后端通信。
