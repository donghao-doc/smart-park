import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LoginResult, UserDto } from '../types/auth'

const AUTH_STORAGE_KEY = 'smart-park.auth'

/**
 * 全局认证状态及其修改方法
 */
export interface AuthStoreState {
  /** 当前登录会话使用的访问令牌 */
  accessToken: string | null
  /** 当前登录用户，未登录时为 null */
  user: UserDto | null
  /** 使用登录接口返回的数据建立完整会话 */
  setSession: (session: LoginResult) => void
  /** 更新当前用户信息，不改变访问令牌 */
  setUser: (user: UserDto) => void
  /** 清除访问令牌和当前用户信息 */
  clearSession: () => void
}

/**
 * 全局认证 Store，持久化会话以便页面刷新后恢复登录状态
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: ({ accessToken, user }) => {
        set({ accessToken, user })
      },
      setUser: (user) => {
        set({ user })
      },
      clearSession: () => {
        set({ accessToken: null, user: null })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, user }) => ({ accessToken, user }),
    },
  ),
)
