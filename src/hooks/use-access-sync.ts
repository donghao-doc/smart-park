import { useEffect, useRef } from 'react'
import { useRevalidator } from 'react-router'

import { initializeDynamicRoutes } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { ACCESS_CHANGED_EVENT } from '@/utils/access-events'

/** 授权变更及重新激活页面时同步访问权限，重新校验当前路由并注册新增菜单 */
export default function useAccessSync() {
  const token = useAuthStore((state) => state.accessToken)
  const revalidator = useRevalidator()
  const revalidatorRef = useRef(revalidator)
  useEffect(() => {
    revalidatorRef.current = revalidator
  }, [revalidator])

  useEffect(() => {
    if (!token) return
    let active = true
    let refreshing = false
    let pending = false

    /** 合并授权变更事件，防止旧会话响应覆盖新账号 */
    async function refresh() {
      if (refreshing) {
        pending = true
        return
      }
      refreshing = true
      try {
        do {
          pending = false
          await Promise.all([
            useUserStore.getState().reqLoadCurrentUser(true),
            useMenuStore.getState().reqLoadMenus(true),
          ])
          if (!active || useAuthStore.getState().accessToken !== token) return
          await initializeDynamicRoutes()
          void revalidatorRef.current.revalidate()
        } while (pending && active)
      } finally {
        refreshing = false
      }
    }

    function handleRefresh() {
      void refresh()
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') handleRefresh()
    }

    const channel =
      typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(ACCESS_CHANGED_EVENT)
    if (channel) channel.onmessage = handleRefresh
    window.addEventListener(ACCESS_CHANGED_EVENT, handleRefresh)
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      active = false
      channel?.close()
      window.removeEventListener(ACCESS_CHANGED_EVENT, handleRefresh)
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [token])
}
