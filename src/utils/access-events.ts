/** 当前页面收到授权变更时使用的应用事件名 */
export const ACCESS_CHANGED_EVENT = 'smart-park:access-changed'

/** 通知所有应用标签页刷新角色、菜单及按钮权限 */
export function notifyAccessChanged() {
  window.dispatchEvent(new Event(ACCESS_CHANGED_EVENT))
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(ACCESS_CHANGED_EVENT)
    channel.postMessage('refresh')
    channel.close()
  }
}
