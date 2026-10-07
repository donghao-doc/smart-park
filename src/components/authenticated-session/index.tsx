import { Outlet } from 'react-router'

import useAccessSync from '@/hooks/use-access-sync'

/** 已登录页面的会话权限同步入口，权限不足页面也可接收后续授权变化 */
export default function AuthenticatedSession() {
  useAccessSync()
  return <Outlet />
}
