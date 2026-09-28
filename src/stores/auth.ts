import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'smart-park.auth'

/**
 * 全局认证状态及其修改方法
 */
export interface AuthStoreState {
  /** 当前登录会话使用的访问令牌 */
  accessToken: string | null
  /** 设置当前登录会话使用的访问令牌 */
  setAccessToken: (accessToken: string) => void
  /** 清除当前访问令牌 */
  clearSession: () => void
}

/**
 * 全局认证 Store，持久化会话以便页面刷新后恢复登录状态
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => {
        set({ accessToken })
      },
      clearSession: () => {
        set({ accessToken: null })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken }) => ({ accessToken }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AuthStoreState>
        return { accessToken: typeof state.accessToken === 'string' ? state.accessToken : null }
      },
    },
  ),
)
