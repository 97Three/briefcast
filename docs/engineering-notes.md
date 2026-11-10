# 工程说明 · Engineering notes

记录 Briefcast 的实现取舍与验证方式。产品介绍见 [README](../README.md)，前端细节见 [前端文档](../frontend/README.md)。

---

## 一、仓库结构

```
.
├─ src/sourcebound/            后端：研究图、简报流水线、Provider 适配、API
│  ├─ graph.py                 通用研究循环（plan → search → assess → draft → verify）
│  ├─ briefing.py              会前简报流水线（含日期闸门与引文核验）
│  ├─ providers.py             DeepSeek / Tavily 适配
│  ├─ schemas.py               Pydantic 契约（后端的唯一事实源）
│  └─ api.py                   FastAPI 接口 + SSE
├─ tests/                      后端测试（含注入式 fake provider）
├─ frontend/                   Vue 3 前端
├─ docs/                       契约、样例、评估、工程说明、界面截图
└─ start-dev.bat / .ps1        一键启动脚本
```

---

## 二、关键设计决策

### 1. 流式接口用手写 SSE 解析，而不是 `EventSource`

主流程是 `POST /api/briefing/stream`，而原生 `EventSource` 只支持 GET。因此前端用 `fetch` + `ReadableStream`：

- 按行缓冲，正确处理跨 chunk 断行；
- 空行代表一个事件结束，`event:` 决定类型（`progress` / `result` / `error`）；
- 单条事件解析失败只跳过该条，不打断整条流。

### 2. 状态放模块级单例 composable，而不是状态管理库

输入页发起请求、结果页消费结果，两个视图必须共享同一份状态。`useBriefing` / `useDemoMode` 的 `ref` 定义在模块作用域，并带请求令牌防止并发覆盖。这样无需引入 Pinia，运行时依赖只有 `vue` 与 `vue-router`。

### 3. 打印是独立版面，不是压缩屏幕样式

`PrintBriefing.vue` 为纸张重新排版：左栏动态、右栏问题与来源，来源带**完整 URL**。屏幕版与打印版共用同一份数据结构，但布局与配色分离，避免出现"深色背景被打印成黑块"或"内容被切到两页"。

### 4. 语义集中定义，避免同类字段出现不同说法

`lib/sourceType.ts` 统一定义「官方域名」「事件日期 / 来源发布日期」「搜索摘要」的文案与提示；`lib/format.ts` 统一日期格式（后端可能返回纯日期或完整 ISO 时间戳，两者都收敛为同一观感）。

### 5. 动效只用 `transform` / `opacity`

- 入场：`IntersectionObserver` 触发，按序号 `55ms` 交错；首屏元素直接入场，另有 2 秒兜底，保证任何情况下内容不会停在 `opacity: 0`。
- 进度条用 `scaleX` 而不是宽度动画；当前阶段用 `conic-gradient` + `mask` 的旋转环。
- 尊重 `prefers-reduced-motion`；触屏关闭指针光斑；移动端关闭章节轨与扫描线；打印时全部装饰与交互动效不出现。

### 6. 命令面板复用既有能力

`⌘K` 面板的动作（跳转、复制、打印预览、切演示态、切语言）全部调用已有函数，不引入新的数据通道，也不产生额外的网络请求。

---

## 三、数据语义在前端的落地

| 字段 | 界面处理 |
| --- | --- |
| `date_basis=source_publication` | 只标「来源发布日期」，不称为事件发生日 |
| `date_basis=explicit_event_date` | 标「事件日期」，可展开 `date_evidence` 原句 |
| `citations[].quote` | 标「原文摘录」，说明已与正文精确匹配 |
| `sources[].snippet` | 标「搜索摘要 · 非原文引述」 |
| `meeting_implication` | 独立区块，标「会议推断」 |
| `research_stats` | 标「处理统计」，注明不是可信度评分 |
| `source_type=official` | 标「官方域名」，提示仅表示网址匹配 |
| `development_ids` | 仅用于点击定位，不进入界面文案 |

---

## 四、验证记录

### 构建

`npm run build`（`vue-tsc` 严格模式 + Vite）通过。产物约 `JS 205 KB / gzip 75 KB`、`CSS 44 KB / gzip 9.4 KB`。

### 真实运行（浏览器端到端）

驱动真实浏览器完成"填表 → 生成 → 结果"全流程：

- 输入 `Microsoft / 2026-11-26 15:00 / 讨论企业 AI 产品合作`，约 50 秒返回；
- SSE 六个阶段进度真实推进，进度页的实时事件流显示真实耗时（如 `+3.2s plan`、`+8.9s search`）；
- 结果状态 `partial`：1 条动态、3 个问题、12 个来源，界面正常渲染。

### 交互

| 检查项 | 结果 |
| --- | --- |
| 点击问题 | 精确定位并只高亮其关联动态 |
| 点击引文 | 打开来源侧栏，含原文摘录 / 标题 / 发布日期 / 检索式 / 原网页链接 |
| 悬停引文（桌面） | 浮出预览卡，触屏直接开侧栏 |
| `J` / `K` | 在证据间移动，`Enter` 打开来源，`Esc` 关闭浮层 |
| `⌘K` 命令面板 | 分组动作、输入自动聚焦、可过滤、`Esc` 关闭 |
| 复制简报 | 按钮变为「已复制」，剪贴板含动态、问题、局限与带 URL 的来源 |

### 打印与响应式

- `--print-to-pdf` 输出 **1 页 A4**，版面无交互控件，来源含完整 URL。
- 以 390px 真实视口验证输入页与结果页：无横向溢出，长文本正常换行。
- 中英双语界面均无溢出，所有区块可见。

### 密钥隔离

`dist/` 与源码中均未命中任何密钥值或 `sk-…` / `tvly-…` 模式；浏览器只与本项目后端通信。密钥仅存在于后端 `.env`。

---

## 五、已知问题与限制

1. **检索超时余量与瞬时失败**：Tavily `advanced` + 正文抓取的单次耗时在 10 秒量级，并发检索偶发变慢。后端已把单查询超时提高到 65 秒并对可重试错误做一次退避重试；若仍失败，接口返回可读的失败信息而不是静默空结果。
2. **`published_at` 形态不统一**：真实结果是完整 ISO 时间戳，演示样例是纯日期。前端已在展示层统一为 `YYYY-MM-DD`，原值保留在 `title`。
3. **不返回页面正文**：接口只下发引文与链接，因此应用内无法高亮原网页段落。这是接口的有意设计。
4. **无历史归档**：每次运行结果保存在内存，刷新后需重新生成。
5. **演示数据为虚构**：界面始终带黄色演示标记，打印版也带声明。

---

## 六、Tailwind 注意事项

自定义透明度档位只支持默认刻度：`border-white/12` 这类写法在模板中**不报错，只会静默丢样式**，应写成 `border-white/[0.12]`。
修改 `tailwind.config.js` 或类名后若开发服务器仍报旧错误，重启 `npm run dev` 即可（JIT 缓存）。
