import type { BriefingRequest, BriefingResult, ProgressEvent, ErrorEvent, HealthResponse } from '../types'

/**
 * API 前缀。
 * 默认空字符串：走同源 /api，由 Vite 代理或反向代理转发到后端。
 * 前后端分域部署时可用公开变量指定，例如 VITE_API_BASE_URL=https://api.example.com
 * 这里只允许放地址，任何密钥都必须留在后端。
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

/** 把 HTTP 状态码翻译成用户能理解的提示 */
function httpError(status: number): Error {
  if (status === 422) return new Error('请求参数无效，请检查会议时间是否包含时区信息')
  if (status === 503) return new Error('服务未配置 API 密钥（DeepSeek / Tavily）')
  if (status === 502) return new Error('研究流程执行失败，请稍后重试')
  return new Error(`请求失败（HTTP ${status}）`)
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(apiUrl('/api/health'))
  if (!response.ok) {
    throw new Error('Failed to check service health')
  }
  return response.json()
}

/** 简单请求：同一请求体直接拿最终 JSON，便于调试 */
export async function createBriefing(request: BriefingRequest): Promise<BriefingResult> {
  const response = await fetch(apiUrl('/api/briefing'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  if (!response.ok) throw httpError(response.status)

  return response.json()
}

export type BriefingStreamEvent =
  | { type: 'progress'; data: ProgressEvent }
  | { type: 'result'; data: BriefingResult }
  | { type: 'error'; data: ErrorEvent }

/**
 * 流式请求：POST + fetch + ReadableStream 解析 SSE。
 * 原生 EventSource 只支持 GET，所以这里手写解析：
 * 按行缓冲（处理分块边界），空行代表一个事件结束，`event:` 决定事件类型。
 */
export async function* streamBriefing(request: BriefingRequest): AsyncGenerator<BriefingStreamEvent> {
  const response = await fetch(apiUrl('/api/briefing/stream'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(request)
  })

  if (!response.ok) throw httpError(response.status)
  if (!response.body) throw new Error('响应体为空，无法读取进度')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = ''
  let dataLines: string[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 仅按 \n 切分，剩余部分留到下一次读取（可能是不完整的一行）
      let newlineIndex: number
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const rawLine = buffer.slice(0, newlineIndex)
        buffer = buffer.slice(newlineIndex + 1)
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine

        if (line === '') {
          // 事件结束
          if (dataLines.length > 0) {
            const parsed = parseEvent(eventName, dataLines.join('\n'))
            dataLines = []
            eventName = ''
            if (parsed) yield parsed
          } else {
            eventName = ''
          }
          continue
        }

        if (line.startsWith(':')) continue // 注释行
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
          continue
        }
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).replace(/^ /, ''))
          continue
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/** 归一化单个 SSE 事件；无法识别时返回 null 而不是抛出，避免整条流被打断 */
function parseEvent(eventName: string, payload: string): BriefingStreamEvent | null {
  let data: unknown
  try {
    data = JSON.parse(payload)
  } catch {
    console.error('[briefing] 无法解析的 SSE 数据：', payload.slice(0, 200))
    return null
  }
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>

  if (eventName === 'progress' || ('stage' in record && 'detail' in record)) {
    return { type: 'progress', data: record as unknown as ProgressEvent }
  }
  if (eventName === 'error' || ('message' in record && 'type' in record)) {
    return { type: 'error', data: record as unknown as ErrorEvent }
  }
  if (eventName === 'result' || 'developments' in record) {
    return { type: 'result', data: record as unknown as BriefingResult }
  }
  return null
}
