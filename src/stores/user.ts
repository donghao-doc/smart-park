import { create } from 'zustand'

import { reqGetCurrentUser } from '../api/auth'
import type { PermissionCode, UserDto } from '../types/auth'
import { useAuthStore } from './auth'

let pendingUserRequest: Promise<UserDto | null> | null = null
let userRequestVersion = 0

/**
 * 当前登录用户状态及其操作
 */
export interface UserStoreState {
  /** 当前登录用户信息，尚未加载或会话已清除时为 null */
  currentUser: UserDto | null
  /** 是否正在加载当前用户信息 */
  loading: boolean
  /** 是否已成功加载当前登录会话的用户信息 */
  loaded: boolean
  /** 最近一次用户信息加载是否失败 */
  loadFailed: boolean
  /** 请求并保存当前登录用户信息，重复调用时复用缓存或进行中的请求 */
  reqLoadCurrentUser: () => Promise<UserDto | null>
  /** 判断当前登录用户是否拥有指定权限 */
  hasPermission: (permission: PermissionCode) => boolean
  /** 清空当前用户及其加载状态 */
  resetUser: () => void
}

/**
 * 全局用户 Store，供布局、权限控制和业务页面共享当前用户信息
 */
export const useUserStore = create<UserStoreState>((set, get) => ({
  currentUser: null,
  loading: false,
  loaded: false,
  loadFailed: false,
  reqLoadCurrentUser: () => {
    if (get().loaded) {
      return Promise.resolve(get().currentUser)
    }

    if (pendingUserRequest) {
      return pendingUserRequest
    }

    const requestVersion = userRequestVersion
    set({ loading: true, loadFailed: false })

    const request = (async () => {
      try {
        const currentUser = await reqGetCurrentUser()
        if (requestVersion === userRequestVersion) {
          set({ currentUser, loaded: true, loadFailed: false })
          return currentUser
        }

        return null
      } catch {
        if (requestVersion === userRequestVersion) {
          set({ currentUser: null, loaded: false, loadFailed: true })
        }
        return null
      } finally {
        if (requestVersion === userRequestVersion) {
          pendingUserRequest = null
          set({ loading: false })
        }
      }
    })()

    pendingUserRequest = request
    return request
  },
  hasPermission: (permission) =>
    get().currentUser?.role.permissions.includes(permission) ?? false,
  resetUser: () => {
    // 使旧会话中仍在执行的请求失效，避免响应覆盖新会话用户
    userRequestVersion += 1
    pendingUserRequest = null
    set({ currentUser: null, loading: false, loaded: false, loadFailed: false })
  },
}))

useAuthStore.subscribe((state, previousState) => {
  if (previousState.accessToken && !state.accessToken) {
    useUserStore.getState().resetUser()
  }
})
