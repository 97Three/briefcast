/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 后端 API 基址（可选）。
   * 只允许填写地址，例如 https://api.example.com；密钥必须留在后端。
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
