/**
 * 页面转场：支持 View Transitions 的浏览器走共享元素过渡，其余静默降级。
 * 只对导航动作生效，不影响任何数据逻辑。
 */
export function supportsViewTransition(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function navigateWithTransition(navigate: () => void) {
  if (!supportsViewTransition()) {
    navigate()
    return
  }
  const doc = document as Document & { startViewTransition: (cb: () => void) => void }
  doc.startViewTransition(() => navigate())
}
