const MESSAGE_DEDUPLICATION_INTERVAL = 2_000
const REDIRECT_LOCK_INTERVAL = 1_000

type ErrorMessageHandler = (content: string) => void
type Navigator = (target: string) => void

let errorMessageHandler: ErrorMessageHandler | undefined
let navigator: Navigator | undefined
let lastMessage = ''
let lastMessageAt = 0
let redirectLocked = false

/**
 * 注入 antd 上下文中的全局错误提示能力
 * @param handler 错误提示回调，传入 undefined 时移除当前回调
 */
export function setErrorMessageHandler(handler: ErrorMessageHandler | undefined) {
  errorMessageHandler = handler
}

/**
 * 注入应用路由跳转能力
 * @param handler 路由跳转回调，传入 undefined 时移除当前回调
 */
export function setHttpNavigator(handler: Navigator | undefined) {
  navigator = handler
}

/**
 * 显示经过短时间去重的全局错误提示
 * @param content 错误提示内容
 */
export function showErrorMessage(content: string) {
  const now = Date.now()
  if (content === lastMessage && now - lastMessageAt < MESSAGE_DEDUPLICATION_INTERVAL) {
    return
  }

  lastMessage = content
  lastMessageAt = now
  errorMessageHandler?.(content)
}

/**
 * 在并发鉴权错误中只执行一次路由跳转
 * @param target 目标应用路由
 */
export function redirectOnce(target: string) {
  if (redirectLocked || !navigator) {
    return
  }

  redirectLocked = true
  navigator?.(target)
  window.setTimeout(() => {
    redirectLocked = false
  }, REDIRECT_LOCK_INTERVAL)
}
