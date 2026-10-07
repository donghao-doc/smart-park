import { createBrowserRouter, redirect, type RouteObject } from 'react-router'

import RouteLoadingFallback from '@/components/route-loading'
import AuthenticatedSession from '@/components/authenticated-session'
import AdminLayout from '@/layout'
import { useAuthStore } from '@/stores/auth'
import { DYNAMIC_ROUTE_PARENT_ID, getFirstMenuPath, initializeMenuRoutes } from './dynamic-routes'
import { lazyPage, preventRepeatedLogin, requireAuthentication } from './utils'

/**
 * 初始化当前登录会话的动态路由后跳转至首个可访问页面
 */
async function redirectToFirstMenu() {
  if (!useAuthStore.getState().accessToken) {
    return null
  }

  const menus = await initializeDynamicRoutes()
  if (!useAuthStore.getState().accessToken) {
    return null
  }

  throw redirect(getFirstMenuPath(menus) ?? '/profile')
}

const routes = [
  {
    path: '/login',
    loader: preventRepeatedLogin,
    HydrateFallback: RouteLoadingFallback,
    lazy: lazyPage(() => import('@/pages/login')),
  },
  {
    id: 'authenticated-root',
    Component: AuthenticatedSession,
    loader: requireAuthentication,
    HydrateFallback: RouteLoadingFallback,
    // 共同父级路由保持不变时也重新校验，以同步最后访问的已登录页面
    shouldRevalidate: () => true,
    children: [
      {
        id: DYNAMIC_ROUTE_PARENT_ID,
        path: '/',
        Component: AdminLayout,
        children: [
          {
            path: '/profile',
            // 个人中心不依赖业务菜单权限，直接访问时仍需初始化侧栏菜单
            loader: async () => {
              await initializeDynamicRoutes()
              return null
            },
            lazy: lazyPage(() => import('@/pages/profile')),
          },
          {
            index: true,
            loader: redirectToFirstMenu,
            Component: RouteLoadingFallback,
          },
        ],
      },
      {
        path: '/403',
        lazy: lazyPage(() => import('@/pages/403')),
      },
      {
        path: '*',
        lazy: lazyPage(() => import('@/pages/404')),
      },
    ],
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes, {
  patchRoutesOnNavigation: async ({ patch, signal }) => {
    await initializeMenuRoutes(patch, signal)
  },
})

/**
 * 初始化当前登录会话的菜单和动态路由，重复调用时复用菜单缓存和已注册路由
 */
export function initializeDynamicRoutes() {
  return initializeMenuRoutes((routeId, children) => router.patchRoutes(routeId, children))
}

export default router
