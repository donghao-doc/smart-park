import { Spin } from 'antd'

import './route-loading.scss'

/**
 * 路由初始化和懒加载期间展示的全屏加载状态
 */
function RouteLoadingFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <Spin size="large" />
      <span>页面加载中</span>
    </div>
  )
}

export default RouteLoadingFallback
