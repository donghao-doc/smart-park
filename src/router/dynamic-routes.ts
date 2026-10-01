import { redirect, type LoaderFunction, type RouteObject } from 'react-router'

import RouteLoadingFallback from '../components/route-loading'
import { useAuthStore } from '../stores/auth'
import { useMenuStore } from '../stores/menu'
import type { MenuItemDto } from '../types/menu'
import { lazyPage } from './utils'

/** 动态业务路由挂载到后台布局时使用的父路由标识 */
export const DYNAMIC_ROUTE_PARENT_ID = 'admin-layout'

const registeredRouteIds = new Set<string>()

const pageLazyLoaders: Readonly<Record<string, NonNullable<RouteObject['lazy']>>> = {
  dashboard: lazyPage(() => import('../pages/dashboard')),
  'park-profile': lazyPage(() => import('../pages/park-profile')),
  'enterprise-list': lazyPage(() => import('../pages/enterprise-list')),
  'personnel-list': lazyPage(() => import('../pages/personnel-list')),
  'visitor-appointments': lazyPage(() => import('../pages/visitor-appointments')),
  'visitor-records': lazyPage(() => import('../pages/visitor-records')),
  'vehicle-list': lazyPage(() => import('../pages/vehicle-list')),
  'parking-records': lazyPage(() => import('../pages/parking-records')),
  'work-order-list': lazyPage(() => import('../pages/work-order-list')),
  'device-list': lazyPage(() => import('../pages/device-list')),
  'system-users': lazyPage(() => import('../pages/system-users')),
  'operation-logs': lazyPage(() => import('../pages/operation-logs')),
  'mock-data-management': lazyPage(() => import('../pages/mock-data-management')),
}

/**
 * 在菜单树中按访问路径查找节点
 * @param menus 当前账号可访问的菜单树
 * @param path 待查找的路由路径
 */
function findMenuByPath(menus: MenuItemDto[], path: string): MenuItemDto | undefined {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }

    const matchedChild = findMenuByPath(menu.children, path)
    if (matchedChild) {
      return matchedChild
    }
  }

  return undefined
}

/**
 * 创建动态页面访问校验，避免切换账号后已注入的旧路由绕过新菜单权限
 * @param path 动态页面路由路径
 * @param hasPageComponent 菜单组件标识是否存在对应页面
 */
function createMenuAccessLoader(path: string, hasPageComponent: boolean): LoaderFunction {
  return () => {
    if (!useAuthStore.getState().accessToken) {
      return null
    }

    const menu = findMenuByPath(useMenuStore.getState().menus, path)

    if (!menu || menu.type !== 'menu') {
      throw redirect('/403')
    }

    if (!hasPageComponent) {
      throw redirect('/404')
    }

    return null
  }
}

/**
 * 创建菜单目录重定向逻辑，始终使用当前账号接口返回的重定向地址
 * @param path 菜单目录路径
 */
function createDirectoryLoader(path: string): LoaderFunction {
  return () => {
    if (!useAuthStore.getState().accessToken) {
      return null
    }

    const menu = findMenuByPath(useMenuStore.getState().menus, path)

    if (!menu || menu.type !== 'directory') {
      throw redirect('/403')
    }

    throw redirect(menu.redirect ?? '/404')
  }
}

/**
 * 将菜单树递归转换为可挂载的扁平路由列表
 * @param menus 接口返回的菜单树
 */
function createMenuRoutes(menus: MenuItemDto[]): RouteObject[] {
  return menus.flatMap((menu) => {
    if (menu.type === 'directory') {
      return [
        {
          id: `dynamic-directory-${menu.id}`,
          path: menu.path,
          loader: createDirectoryLoader(menu.path),
          Component: RouteLoadingFallback,
        },
        ...createMenuRoutes(menu.children),
      ]
    }

    const pageLazyLoader = pageLazyLoaders[menu.componentKey]

    return [
      {
        id: `dynamic-menu-${menu.id}`,
        path: menu.path,
        // 组件标识不在白名单时跳转到独立 404 页面，禁止通过接口字段导入任意模块
        loader: createMenuAccessLoader(menu.path, Boolean(pageLazyLoader)),
        lazy: pageLazyLoader,
      },
    ]
  })
}

/**
 * 将尚未注册的菜单路由注入后台布局
 * @param patch React Router 路由注入函数
 * @param menus 当前账号可访问的菜单树
 */
export function patchMenuRoutes(
  patch: (routeId: string | null, children: RouteObject[]) => void,
  menus: MenuItemDto[],
) {
  const routes = createMenuRoutes(menus).filter(
    (route) => route.id && !registeredRouteIds.has(route.id),
  )

  if (routes.length === 0) {
    return
  }

  patch(DYNAMIC_ROUTE_PARENT_ID, routes)
  routes.forEach((route) => {
    if (route.id) {
      registeredRouteIds.add(route.id)
    }
  })
}

/**
 * 加载当前登录会话的菜单并注册对应动态路由
 * @param patch React Router 路由注入函数
 * @param signal 当前路由发现任务的取消信号
 */
export async function initializeMenuRoutes(
  patch: (routeId: string | null, children: RouteObject[]) => void,
  signal?: AbortSignal,
) {
  if (!useAuthStore.getState().accessToken) {
    if (!signal?.aborted) {
      patchMenuRoutes(patch, [])
    }
    return []
  }

  const menus = await useMenuStore.getState().reqLoadMenus()
  if (signal?.aborted) {
    return []
  }

  patchMenuRoutes(patch, useAuthStore.getState().accessToken ? menus : [])
  return menus
}

/**
 * 获取菜单树中的首个可访问页面路径
 * @param menus 当前账号可访问的菜单树
 */
export function getFirstMenuPath(menus: MenuItemDto[]): string | undefined {
  for (const menu of menus) {
    if (menu.type === 'menu') {
      return menu.path
    }

    const childPath = getFirstMenuPath(menu.children)
    if (childPath) {
      return childPath
    }
  }

  return undefined
}
