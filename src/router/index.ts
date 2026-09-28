import { createBrowserRouter, type RouteObject } from 'react-router'

import AdminLayout from '../layout'
import ForbiddenPage from '../pages/403'
import NotFoundPage from '../pages/404'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import { preventRepeatedLogin, requireAuthentication } from './utils'

/**
 * 尚未实现的业务页面占位，仅保留后台通用布局
 */
function EmptyPage() {
  return null
}

const routes = [
  {
    path: '/login',
    loader: preventRepeatedLogin,
    Component: LoginPage,
  },
  {
    loader: requireAuthentication,
    // 共同父级路由保持不变时也重新校验，以同步最后访问的已登录页面
    shouldRevalidate: () => true,
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            path: '/dashboard',
            Component: HomePage,
          },
          { path: '/enterprises', Component: EmptyPage },
          { path: '/personnel', Component: EmptyPage },
          { path: '/visitors/appointments', Component: EmptyPage },
          { path: '/parking/vehicles', Component: EmptyPage },
          { path: '/work-orders', Component: EmptyPage },
          { path: '/devices', Component: EmptyPage },
          { path: '/system/users', Component: EmptyPage },
        ],
      },
      {
        path: '/403',
        Component: ForbiddenPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes)

export default router
