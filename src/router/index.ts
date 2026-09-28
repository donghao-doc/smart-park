import { createBrowserRouter, type RouteObject } from 'react-router'

import AdminLayout from '../layout'
import ForbiddenPage from '../pages/403'
import NotFoundPage from '../pages/404'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'

/**
 * 尚未实现的业务页面占位，仅保留后台通用布局
 */
function EmptyPage() {
  return null
}

const routes = [
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
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/403',
    Component: ForbiddenPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes)

export default router
