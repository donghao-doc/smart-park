import { create } from 'zustand'

import { reqGetCurrentUserMenus } from '../api/auth'
import type { MenuItemDto } from '../types/menu'

let pendingMenuRequest: Promise<void> | null = null
let menuRequestVersion = 0

/**
 * 动态菜单状态及其操作
 */
export interface MenuStoreState {
  /** 当前登录用户可访问的菜单树 */
  menus: MenuItemDto[]
  /** 是否正在加载菜单 */
  loading: boolean
  /** 最近一次菜单加载是否失败 */
  loadFailed: boolean
  /** 请求并更新当前登录用户的菜单树 */
  reqLoadMenus: () => Promise<void>
  /** 清空菜单及其加载状态 */
  resetMenus: () => void
}

/**
 * 全局动态菜单 Store，供侧栏、动态路由和面包屑共享菜单数据
 */
export const useMenuStore = create<MenuStoreState>((set) => ({
  menus: [],
  loading: false,
  loadFailed: false,
  reqLoadMenus: () => {
    if (pendingMenuRequest) {
      return pendingMenuRequest
    }

    const requestVersion = menuRequestVersion
    set({ loading: true, loadFailed: false })

    const request = (async () => {
      try {
        const menus = await reqGetCurrentUserMenus()
        if (requestVersion === menuRequestVersion) {
          set({ menus, loadFailed: false })
        }
      } catch {
        if (requestVersion === menuRequestVersion) {
          set({ menus: [], loadFailed: true })
        }
      } finally {
        if (requestVersion === menuRequestVersion) {
          pendingMenuRequest = null
          set({ loading: false })
        }
      }
    })()

    pendingMenuRequest = request
    return request
  },
  resetMenus: () => {
    // 使仍在执行的旧会话请求失效，避免响应覆盖新会话菜单
    menuRequestVersion += 1
    pendingMenuRequest = null
    set({ menus: [], loading: false, loadFailed: false })
  },
}))
