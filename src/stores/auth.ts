import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'smart-park.auth'

/**
 * 从持久化认证状态中读取访问令牌
 */
function getStoredAccessToken() {
  if (typeof localStorage === 'undefined') {
    return null
  }

  try {
    const persistedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!persistedAuth) {
      return null
    }

    const parsedAuth: unknown = JSON.parse(persistedAuth)
    if (!parsedAuth || typeof parsedAuth !== 'object' || !('state' in parsedAuth)) {
      return null
    }

    const persistedState = parsedAuth.state
    if (
      !persistedState ||
      typeof persistedState !== 'object' ||
      !('accessToken' in persistedState)
    ) {
      return null
    }

    return typeof persistedState.accessToken === 'string' ? persistedState.accessToken : null
  } catch {
    return null
  }
}

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
      accessToken: getStoredAccessToken(),
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
        return {
          accessToken: typeof state.accessToken === 'string' ? state.accessToken : null,
        }
      },
    },
  ),
)
