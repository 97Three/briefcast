<div align="center">

# Briefcast

**会前研究情报工作台 · Evidence-first pre-meeting intelligence**

把一场会议需要的背景，压缩成三句话：**最近 30 天发生了什么 · 对这次会议意味着什么 · 会上值得问什么**

`Vue 3` · `TypeScript` · `Vite` · `Tailwind CSS` · `FastAPI` · `LangGraph` · `DeepSeek` · `Tavily`

<sub>Global AI Hackathon · Problem Statement 05 — Build a Pre-Meeting Briefing Agent (Tavily)</sub>

</div>

![Briefcast 简报结果页](docs/frontend-screens/02-briefing-demo.png)

> 上图为演示数据界面。所有演示内容都有明确的黄色标记，不会与真实研究结果混淆。

---

## 为什么做这件事 · Why

**中文** — 会前准备最耗时的不是开会，而是开会前的两个小时：翻新闻、翻官网、翻社交账号，然后在电梯里努力想起"他们上个月到底发布了什么"。通用搜索能给你一堆链接，却不会告诉你哪一条是**这次对话真正能用上的**，更不会告诉你它凭什么可信。

Briefcast 把这件事变成一个可重复的流程：给出研究对象、会议时间和会议目的，它在会议前 30 天的时间窗口里检索公开报道，把每一条事实**回溯到网页正文里的原句**，再把事实转成可以直接在会上问出口的问题。

**English** — The expensive part of a meeting is not the hour itself, it is the two hours before it: scanning news, changelogs and social posts, then trying to recall what they actually shipped last month. Search gives you links; it does not tell you which link matters for *this* conversation, or why you should believe it.

Briefcast turns that into a repeatable pipeline. Give it a subject, a meeting time and a goal; it researches the 30-day window before the meeting, traces every claim back to **a verbatim sentence in the article text**, and converts verified facts into questions you can ask out loud.

---

## 它会回答什么 · What it answers

| | 中文 | English |
| --- | --- | --- |
| **01** | **最近 30 天发生了什么** —— 最多四条已核实动态，按时间排列，每条带日期依据与来源引文 | **What happened** — up to four verified developments on a timeline, each with its date basis and a source quote |
| **02** | **这对会议意味着什么** —— 基于事实的会议推断，与事实分区块呈现，不冒充结论 | **What it means for the meeting** — an explicitly framed inference, visually separated from the facts |
| **03** | **会上值得问什么** —— 最多三个问题，每个都绑定到具体动态，点一下就能回到对应证据 | **What to ask** — up to three questions, each bound to specific developments; one click jumps back to the evidence |

---

## 赛题要求对照 · Requirement coverage

| 赛题要求 | 本项目的实现 |
| --- | --- |
| **Meeting context**：输入公司 / 人物与会议时间 | 输入页支持公司或人物，`meeting_at` 必须带时区；补充信息（所属机构、官网域名、参会人）用于消歧 |
| **Recent research**：最近 30 天的动态 | 时间窗口由**会议时间倒推 30 天**，覆盖发布、渠道、合作、人事、融资等；`plan → search → assess` 最多两轮检索 |
| **Concise briefing**：一页结构化报告 | 屏幕版单页阅读；打印为**一页 A4** 独立版式（实测 `--print-to-pdf` 输出 1 页） |
| **Source attribution**：事实可核验 | 每条事实挂 `[S1]` 引文，可展开原文摘录 / 标题 / 发布日期 / 检索时间 / 检索式 / 原网页链接；**搜索摘要不被当作原文引述** |
| **Open questions**：会上可用的讨论点 | 最多三个问题，每个绑定到具体动态，点击即可回到对应证据 |
| 指引：区分已核实与不确定信息，不编造 | 事实与「会议推断」在结构与视觉上分离；引文经正文精确匹配 + 语义二次判定；证据不足时明确交白卷（`insufficient_evidence`），不填充内容 |
| 指引：Tavily 提供检索能力 | 使用 Tavily news 检索（`topic=news` + 日期区间 + 正文抓取），检索结果经日期 / 域名 / 重复三重闸门 |

> 赛题原文提醒「AI 生成的摘要常常把没有支撑的信息当作事实」。本项目把这一点当成核心命题：**没有通过核验的动态不会进入简报**，界面上的每个数字都是处理计数而不是可信度评分。

---

## 页面导览 · Product tour

### 01 输入 · Input

填写研究对象与会议时间即可开始，公司 / 人物、所属机构、官网域名、参会人等补充信息默认折叠，不打扰主路径。

![输入页](docs/frontend-screens/01-input.png)

<details>
<summary>English</summary>

Subject and meeting time are all that is required. Company/person type, organization, official domain and attendee stay collapsed until you need them.

</details>

### 02 生成进度 · Live research progress

进度不是估算动画：`plan → search → assess → draft → verify → compose` 六个阶段来自后端真实推送的 SSE 事件，右下角的**实时事件流**显示每个阶段的真实耗时与检索结果数量。

![进度页与实时事件流](docs/frontend-screens/09-progress-live-events.png)

### 03 一页简报 · The brief

事实在时间轴上，推断在紫色区块里，两者在视觉与结构上都不混在一起。图上标明了图例：**已核实事实 / 会议推断 / 可展开来源引文**。

### 04 来源详情 · Source drawer

点击任意引文 `[S1]`，右侧展开完整来源：原文摘录、来源标题、发布日期、来源类型、检索时间、检索式、搜索摘要（明确标注**非原文引述**），以及原网页链接。日期标签也可以点开——展开的是支持该日期的原句。

![来源详情侧栏](docs/frontend-screens/03-source-drawer.png)

### 05 一页 A4 打印版 · Print layout

打印不是把网页压扁，而是一份重新排版的报纸式版面：左栏动态、右栏问题与来源，**来源带完整 URL**，供离线阅读与会议记录归档。

![打印预览](docs/frontend-screens/04-print-preview.png)

### 06 命令面板与键盘操作 · Command palette

`⌘K` / `Ctrl K` 打开命令面板，可跳转、复制简报、打印预览、切换演示态与界面语言。结果页用 `J` / `K` 在证据之间移动，`Enter` 打开当前证据的来源，`Esc` 关闭任何浮层。

![命令面板](docs/frontend-screens/10-command-palette.png)

### 07 中英双语 · Bilingual

界面、演示数据、来源说明、复制文本与打印版均支持中文 / English 切换，语言选择会保存在本地并作为新建简报的默认正文语言。

![英文界面](docs/frontend-screens/13-english-ui.png)

### 08 移动端 · Mobile

手机宽度下可用：时间轴改为单列、章节轨与悬停特效自动关闭、动画降级，信息密度仍保持一致。

![移动端](docs/frontend-screens/08-mobile.png)

### 09 边界状态 · Edge states

| 状态 | 界面行为 |
| --- | --- |
| `completed` | 正常简报 |
| `partial` | 仍展示已核实部分，同时列出研究局限 |
| `insufficient_evidence` | 明确说明"没有可核实的近期动态"，**不用未核实内容填充版面** |
| 流中断 / `error` | 中断页 + 返回重试，不丢已完成信息 |

![证据不足状态](docs/frontend-screens/06-insufficient-state.png)

---

## 设计原则：先可核验，再谈叙事 · Evidence before eloquence

这一版最花时间的不是界面，而是**让界面不撒谎**：

| 字段 | 界面处理 |
| --- | --- |
| `date_basis=explicit_event_date` | 标「事件日期」，可展开支持该日期的原句 |
| `date_basis=source_publication` | 只标「来源发布日期」，**绝不**称为事件发生日 |
| `citations[].quote` | 标「原文摘录」，说明已与正文精确匹配 |
| `sources[].snippet` | 标「搜索摘要 · 非原文引述」 |
| `meeting_implication` | 独立区块标「会议推断」，与已核实事实分开 |
| `research_stats` | 标「处理统计」，注明**不是**可信度评分 |
| `source_type=official` | 标「官方域名」，提示仅表示网址匹配，不代表独立证实 |
| `development_ids` | 只用于点击定位，不出现在任何界面文案里 |

**中文** — 没有通过核验的动态不会出现在简报里；证据不足时宁可交白卷，也不编内容。

**English** — Unverified developments never reach the brief. When evidence is insufficient, the product says so instead of filling the page.

---

## 架构 · Architecture

```
浏览器 (Vue 3)
   │  POST /api/briefing/stream   ← fetch + ReadableStream 解析 SSE
   ▼
FastAPI  ──►  LangGraph 研究图
                 │
                 ├─ plan      用会议时间倒推 30 天窗口，生成带日期的检索计划
                 ├─ search    Tavily news 检索 → 日期 / 域名 / 重复 三重闸门
                 ├─ assess    证据不足则发起一次聚焦补充检索
                 ├─ draft     只基于带正文的来源起草动态
                 ├─ verify    精确引文匹配 + 语义支持二次判定
                 └─ compose   仅由被接受的动态生成会议问题
                 │
                 ▼
            DeepSeek（规划 / 起草 / 判定）    Tavily（检索 + 正文）
```

- 时间窗口由**会议时间**决定，不是自然月；未来日期与无法解析发布日期的结果会被排除。
- 全流程最多两轮检索、十二个唯一来源，避免无界扩张。
- 模型不会直接把 URL 或发布日期写进最终结果：来源与日期由后端确定性写入。

---

## 快速开始 · Quick start

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

一键启动：`start-dev.bat` 或 `start-dev.ps1`。

| 入口 | 内容 |
| --- | --- |
| `http://localhost:5173/` | 输入页 |
| `http://localhost:5173/briefing` | 真实运行（SSE 进度 → 简报） |
| `http://localhost:5173/briefing?demo=completed` | 演示态（`partial` / `insufficient` / `error`） |
| `http://localhost:5173/briefing?demo=completed&paper=1` | 一页 A4 打印预览 |

密钥只写在项目根 `.env`，**不会进入前端代码、浏览器请求或构建产物**。

---

## 接口 · API

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

---

## 工程说明 · Engineering notes

实现细节、设计取舍与逐项验证记录在 [工程说明](docs/engineering-notes.md)；前端结构、数据语义与部署方式见 [前端文档](frontend/README.md)。

## 已知局限 · Known limits

- 检索可能不完整：**缺少可解析发布日期的结果会被排除**，即使它相关。
- 精确引文匹配只能证明"这句话确实被抓取到了"，不能证明解读正确；语义支持由模型判定，仍建议对代表性简报做人工抽样。
- 每次运行结果保存在内存中，不提供历史归档。
- 演示数据为虚构样例，界面始终带演示标记。

---

## 许可 · License

[MIT](LICENSE)
