import { redirect, type LoaderFunctionArgs } from 'react-router'

import { useAuthStore } from '../stores/auth'

const LOGIN_PATH = '/login'
const DEFAULT_AUTHENTICATED_PATH = '/dashboard'

/**
 * 校验受保护页面的登录状态，未登录时携带原目标地址前往登录页
 * @param request 当前路由请求
 */
export function requireAuthentication({ request }: LoaderFunctionArgs) {
  if (useAuthStore.getState().accessToken) {
    return null
  }

  const targetUrl = new URL(request.url)
  const redirectPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
  throw redirect(`${LOGIN_PATH}?redirect=${encodeURIComponent(redirectPath)}`)
}

/**
 * 阻止已登录用户重复进入登录页，站内导航时保持在当前页面
 */
export function preventRepeatedLogin() {
  if (!useAuthStore.getState().accessToken) {
    return null
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  throw redirect(currentPath.startsWith(LOGIN_PATH) ? DEFAULT_AUTHENTICATED_PATH : currentPath)
}
