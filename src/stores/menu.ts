import { create } from 'zustand'

import { reqGetCurrentUserMenus } from '@/api'
import type { MenuItemDto } from '@/types/menu'

let pendingMenuRequest: Promise<MenuItemDto[]> | null = null
let menuRequestVersion = 0

/**
 * 动态菜单状态及其操作
 */
export interface MenuStoreState {
  /** 当前登录用户可访问的菜单树 */
  menus: MenuItemDto[]
  /** 是否正在加载菜单 */
  loading: boolean
  /** 是否已成功加载当前登录会话的菜单 */
  loaded: boolean
  /** 最近一次菜单加载是否失败 */
  loadFailed: boolean
  /** 请求并更新当前登录用户的菜单树，force 为 true 时重新请求，返回当前会话可访问的菜单 */
  reqLoadMenus: (force?: boolean) => Promise<MenuItemDto[]>
  /** 清空菜单及其加载状态 */
  resetMenus: () => void
}

/**
 * 全局动态菜单 Store，供侧栏、动态路由和面包屑共享菜单数据
 */
export const useMenuStore = create<MenuStoreState>((set, get) => ({
  menus: [],
  loading: false,
  loaded: false,
  loadFailed: false,
  reqLoadMenus: (force = false) => {
    if (get().loaded && !force) {
      return Promise.resolve(get().menus)
    }

    if (pendingMenuRequest) {
      return pendingMenuRequest
    }

    const requestVersion = menuRequestVersion
    set({ loading: true, loadFailed: false })

    const request = (async () => {
      try {
        const menus = await reqGetCurrentUserMenus()
        if (requestVersion === menuRequestVersion) {
          set({ menus, loaded: true, loadFailed: false })
          return menus
        }

        return []
      } catch {
        if (requestVersion === menuRequestVersion) {
          set({ menus: [], loaded: false, loadFailed: true })
        }
        return []
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
    set({
      menus: [],
      loading: false,
      loaded: false,
      loadFailed: false,
    })
  },
}))
