# 领取密钥与联调

Tavily 的免费方案列有每月 1,000 API credits，且无需信用卡。DeepSeek API 按用量计费；能否直接调用取决于账号是否有可用余额或赠送额度。[DeepSeek 错误码说明](https://api-docs.deepseek.com/quick_start/error_codes/)将余额不足列为 402 错误。请以各自控制台显示的实时额度为准。

1. 在 [DeepSeek 开放平台](https://platform.deepseek.com/)创建 API 密钥，并检查账号可用余额。
2. 在 [Tavily 控制台](https://app.tavily.com/) 注册或登录，从 API Keys 区域复制开发密钥。
3. 打开项目根目录的 `.env`，填写 `DEEPSEEK_API_KEY` 和 `TAVILY_API_KEY`。默认模型为 `deepseek-flash`；如需更换模型，修改 `DEEPSEEK_MODEL`。
4. 在项目目录运行 `python -m sourcebound.check`，它会各发起一次真实模型请求和搜索请求，只打印是否成功，不打印密钥。
5. 运行 `python -m sourcebound.evaluate`，再人工点开输出中的引用核查质量。

不要把密钥贴进聊天、截图或公开仓库。`.env` 已被 `.gitignore` 排除。
