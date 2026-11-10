<p align="center">
  <img src="assets/banner-v2.svg" alt="Briefcast — 证据优先的会前研究" width="100%">
</p>

<p align="center">
  <strong>证据优先的会前研究。</strong><br>
  把会议前的 30 天，压缩成三个你能当场说出口的答案。
</p>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

---

## 开会前的两个小时

会议本身不贵，贵的是会前那两个小时：翻新闻、翻更新日志、翻社交账号，然后在电梯里努力回忆对方上个月到底发布了什么。

通用搜索能给你一堆链接，却不会告诉你哪一条是**这次对话真正用得上**的，更不会告诉你它凭什么可信。

Briefcast 把这件事变成一个可重复的流程。给出研究对象、会议时间和会议目的，它在会议前 30 天的时间窗口里检索公开报道，把每一条事实**回溯到网页正文里的原句**，再把经过核验的事实转成可以直接在会上问出口的问题。

## 它会回答什么

| | 答案 | 你会拿到什么 |
|---|---|---|
| **01** | **最近发生了什么** | 最多四条已核实动态，按时间排列，每条带日期依据与来源引文 |
| **02** | **这对会议意味着什么** | 明确标注的会议推断，与事实在结构上分开 |
| **03** | **会上值得问什么** | 最多三个问题，每个绑定到具体动态；点一下就能回到对应证据 |

<p align="center">
  <img src="docs/frontend-screens/en/02-briefing-demo.png" alt="Briefcast 一页式会前简报" width="100%">
</p>

## 它不是摘要器，而是证据流水线

- **事实必须有引文。** 每条动态都带 `[S1]`，指向与正文精确匹配的原句。
- **日期必须有依据。** `explicit_event_date` 表示文章明确说明了事件发生时间；`source_publication` 表示只知道来源发布日期。
- **搜索摘要不是引文。** 摘要会被明确标注为搜索摘要，绝不冒充原文。
- **推断必须标注。** 会议意义单独成块，不混进已核实事实。
- **允许交白卷。** 证据不足时明确返回 `insufficient_evidence`，不用未核实内容填满版面。

## 页面导览

### 01 — 输入

只需要研究对象和会议时间。公司/人物类型、所属机构、官网域名、参会人都默认折叠，不打扰主路径。

<p align="center"><img src="docs/frontend-screens/en/01-input.png" alt="输入页" width="100%"></p>

### 02 — 实时研究进度

进度不是装饰动画。`plan → search → assess → draft → verify → compose` 六个阶段来自后端真实推送的 SSE 事件；右下角的实时事件流显示每个阶段的真实耗时与来源数量。

<p align="center"><img src="docs/frontend-screens/en/09-progress-live-events.png" alt="研究进度与实时事件流" width="100%"></p>

### 03 — 来源侧栏

点击任意 `[S1]` 引文，右侧展开完整来源：原文摘录、标题、发布日期、来源类型、检索时间、检索式、搜索摘要（明确标注**非原文引述**），以及原网页链接。日期标签也可以点开——展开的是支持该日期的原句。

<p align="center"><img src="docs/frontend-screens/en/03-source-drawer.png" alt="来源详情侧栏" width="100%"></p>

### 04 — 一页 A4 打印版

打印不是把网页压扁，而是一份重新排版的报纸式版面：左栏动态、右栏问题与来源，来源带完整 URL，方便离线阅读与会议记录归档。

<p align="center"><img src="docs/frontend-screens/en/04-print-preview.png" alt="A4 打印预览" width="100%"></p>

### 05 — 命令面板与键盘操作

`⌘K` / `Ctrl K` 打开命令面板：跳转、复制简报、打印预览、切换演示态与界面语言。结果页用 `J` / `K` 在证据之间移动，`Enter` 打开当前来源，`Esc` 关闭任何浮层。

<p align="center"><img src="docs/frontend-screens/en/10-command-palette.png" alt="命令面板" width="100%"></p>

### 06 — 中英双语

界面、演示数据、来源说明、复制文本与打印版均支持中文 / English。语言选择会保存在本地，并作为新建简报的默认正文语言。

<p align="center"><img src="docs/frontend-screens/en/13-english-ui.png" alt="英文界面" width="100%"></p>

### 07 — 移动端

手机宽度下，时间轴改为单列，章节轨与悬停特效自动关闭，动画降级，信息密度保持一致。

<p align="center"><img src="docs/frontend-screens/en/08-mobile.png" alt="移动端布局" width="56%"></p>

### 08 — 边界状态

| 状态 | 行为 |
| --- | --- |
| `completed` | 正常简报 |
| `partial` | 展示已核实部分，同时列出研究缺口 |
| `insufficient_evidence` | 明确说明没有可核实的近期动态；**不用未核实内容填充版面** |
| 流中断 / `error` | 说明中断原因并允许重试，不丢失已完成信息 |

<p align="center"><img src="docs/frontend-screens/en/06-insufficient-state.png" alt="证据不足状态" width="100%"></p>

## 架构

<p align="center"><img src="assets/architecture-v2.svg" alt="Briefcast 架构：Vue 客户端、FastAPI SSE、LangGraph 流水线、DeepSeek 与 Tavily" width="100%"></p>

- 时间窗口由**会议时间**决定，不是自然月；未来日期与无法解析发布日期的结果会被排除。
- 全流程最多两轮检索、十二个唯一来源，避免无界扩张。
- 模型不会把 URL 或发布日期写进最终结果：来源与日期由后端确定性写入。
- `verify` 结合精确引文匹配与语义支持二次判定。

## 赛题要求对照

| 赛题要求 | Briefcast 的实现 |
| --- | --- |
| **Meeting context** — 公司/人物与会议时间 | 支持公司或人物；`meeting_at` 必须带时区；可选所属机构、官网域名、参会人用于消歧 |
| **Recent research** — 最近 30 天 | 以**会议时间倒推 30 天**为窗口，覆盖发布、渠道、合作、人事、融资等；最多两轮检索 |
| **Concise briefing** — 一页结构化报告 | 屏幕版单页阅读；独立的**一页 A4** 打印版式（已用 `--print-to-pdf` 验证） |
| **Source attribution** — 事实可核验 | 每条事实带 `[S1]` 引文，可展开原文摘录、标题、发布日期、检索时间、检索式与原网页链接；**搜索摘要不被当作原文引述** |
| **Open questions** — 会上可用的问题 | 最多三个问题，每个绑定具体动态，点击即可回到对应证据 |
| 指引 — 区分已核实与不确定信息 | 事实与会议推断在结构与视觉上分离；引文经正文精确匹配 + 语义二次判定；证据不足时明确交白卷 |
| 指引 — Tavily 提供检索能力 | 使用 Tavily news 检索（`topic=news` + 日期区间 + 正文抓取），结果经日期、域名、重复三重闸门 |

> 赛题原文提醒「AI 生成的摘要常常把没有支撑的信息当作事实」。Briefcast 把这一点当成核心命题：**没有通过核验的动态不会进入简报**，界面上的每个数字都是处理计数，不是可信度评分。

## 快速开始

需要 Python 3.11+ 与 Node.js 18+。

```powershell
# 1) 后端
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
Copy-Item .env.example .env      # 填入 DEEPSEEK_API_KEY / TAVILY_API_KEY
.\.venv\Scripts\python.exe -m uvicorn sourcebound.api:app --reload
```

```powershell
# 2) 前端（另一个终端）
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

也可以直接用 `start-dev.bat` / `start-dev.ps1` 一键启动。

| 入口 | 内容 |
| --- | --- |
| `http://localhost:5173/` | 输入页 |
| `http://localhost:5173/briefing` | 真实运行（SSE 进度 → 简报） |
| `http://localhost:5173/briefing?demo=completed` | 演示态（`partial` / `insufficient` / `error`） |
| `http://localhost:5173/briefing?demo=completed&paper=1` | 一页 A4 打印预览 |

密钥只写在项目根 `.env`，**不会进入前端代码、浏览器请求或构建产物**。

## 接口

| 方法 | 说明 |
| --- | --- |
| `GET /api/health` | 服务配置状态，不返回任何凭据 |
| `POST /api/briefing` | 同一请求体，直接返回最终 JSON |
| `POST /api/briefing/stream` | 主流程：`progress` 事件流，最终 `result` 或 `error` |

```json
{
  "entity": "Microsoft",
  "entity_type": "company",
  "official_domain": "microsoft.com",
  "meeting_at": "2026-11-26T15:00:00+08:00",
  "meeting_goal": "讨论企业 AI 产品合作",
  "language": "zh"
}
```

`meeting_at` 必须带时区偏移，否则返回 422。完整契约见 [前端契约](docs/briefing-frontend-contract.md) 与 [演示样例](docs/briefing-sample.json)。

## 工程说明与已知局限

实现细节、设计取舍与逐项验证记录见 [工程说明](docs/engineering-notes.md)；前端结构、数据语义与部署方式见 [前端文档](frontend/README.md)。

- 检索可能不完整；**缺少可解析发布日期的结果会被排除**，即使它相关。
- 精确引文匹配只能证明"这句话确实被抓取到了"，不能证明解读正确；语义支持由模型判定，仍建议对代表性简报做人工抽样。
- 每次运行结果保存在内存中，不提供历史归档。
- 演示数据为虚构样例，界面始终带演示标记。

## 许可证

[MIT](LICENSE)

<sub>为 Global AI Hackathon · Problem Statement 05 — Build a Pre-Meeting Briefing Agent (Tavily) 而做。演示数据为虚构样例，界面中已标注。</sub>
