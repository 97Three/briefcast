import { ref, onMounted } from 'vue'
import { checkHealth } from '../api/client'

export type ServiceState = 'checking' | 'ready' | 'unconfigured' | 'offline'

const state = ref<ServiceState>('checking')
let loaded = false

/**
 * 后端就绪状态。
 * 只反映「是否配置 / 是否可达」，不暴露任何密钥信息。
 */
export function useHealth() {
  async function refresh() {
    state.value = 'checking'
    try {
      const health = await checkHealth()
      const configured = health.deepseek_configured && health.tavily_configured
      state.value = configured ? 'ready' : 'unconfigured'
    } catch {
      state.value = 'offline'
    }
  }

  onMounted(() => {
    if (!loaded) {
      loaded = true
      refresh()
    }
  })

  return { state, refresh }
}
