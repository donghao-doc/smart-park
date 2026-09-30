import { createBrowserRouter, type RouteObject } from 'react-router'

import AdminLayout from '../layout'
import { lazyPage, preventRepeatedLogin, requireAuthentication } from './utils'

const routes = [
  {
    path: '/login',
    loader: preventRepeatedLogin,
    lazy: lazyPage(() => import('../pages/login')),
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
            lazy: lazyPage(() => import('../pages/dashboard')),
          },
          { path: '/park/profile', lazy: lazyPage(() => import('../pages/park-profile')) },
          { path: '/enterprises', lazy: lazyPage(() => import('../pages/enterprise-list')) },
          { path: '/personnel', lazy: lazyPage(() => import('../pages/personnel-list')) },
          {
            path: '/visitors/appointments',
            lazy: lazyPage(() => import('../pages/visitor-appointments')),
          },
          {
            path: '/visitors/records',
            lazy: lazyPage(() => import('../pages/visitor-records')),
          },
          {
            path: '/parking/vehicles',
            lazy: lazyPage(() => import('../pages/vehicle-list')),
          },
          {
            path: '/parking/records',
            lazy: lazyPage(() => import('../pages/parking-records')),
          },
          { path: '/work-orders', lazy: lazyPage(() => import('../pages/work-order-list')) },
          { path: '/devices', lazy: lazyPage(() => import('../pages/device-list')) },
          { path: '/system/users', lazy: lazyPage(() => import('../pages/system-users')) },
          { path: '/system/logs', lazy: lazyPage(() => import('../pages/operation-logs')) },
          {
            path: '/system/mock-data',
            lazy: lazyPage(() => import('../pages/mock-data-management')),
          },
        ],
      },
      {
        path: '/403',
        lazy: lazyPage(() => import('../pages/403')),
      },
      {
        path: '*',
        lazy: lazyPage(() => import('../pages/404')),
      },
    ],
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes)

export default router
