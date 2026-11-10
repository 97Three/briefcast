# 会前简报验收

## 自动检查

`python -m pytest -q` 覆盖输入校验、时区、官方域名、带日期搜索、窗口外资料、无日期资料、旧事件回顾、虚假引文、重复动态、人物所属机构以及 JSON/SSE 接口。所有测试均使用模拟服务，不消耗 API 额度。

## 真实样例

运行 `python -m sourcebound.evaluate_briefing`。默认三个样例在 [briefing-eval-cases.json](briefing-eval-cases.json)，会议时间相对运行日计算。结果写到被 Git 忽略的 `runs/briefing-evaluation.jsonl`，其中包含完整简报和来源 URL，但不包含密钥。每次运行会调用 DeepSeek 和 Tavily，产生 API 用量。

逐条人工检查：

1. 公司/人物确为目标对象，尤其检查同名人物。
2. 文章发布日期处于会议前 30 天；如果文中明确给出事件日期，事件日期也在窗口内。
3. `explicit_event_date` 的 `date_evidence` 原文确实证明事件日期；`source_publication` 不显示为已证实的事件发生日。
4. 每条事实完整地被对应引文支持，来源网页能打开；“会议意义”被清楚标为推断。
5. 同一事件没有重复；讨论问题具体、可问、关联已核实动态。
6. 资料稀少时显示待查项或 `insufficient_evidence`，不编造新闻。

记录每个样例的错误、耗时和修正后变化。模型的语义核验可能误判，自动测试不能替代人工抽查。
