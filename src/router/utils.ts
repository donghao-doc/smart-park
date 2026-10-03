import type { ComponentType } from 'react'
import { redirect, type LoaderFunctionArgs } from 'react-router'

import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const LOGIN_PATH = '/login'
const DEFAULT_AUTHENTICATED_PATH = '/dashboard'
const LAST_AUTHENTICATED_PATH_KEY = 'smart-park.last-authenticated-path'

/**
 * 将页面模块转换为 React Router 路由级懒加载函数
 * @param importPage 页面模块动态导入函数
 */
export function lazyPage(importPage: () => Promise<{ default: ComponentType }>) {
  return async () => {
    const pageModule = await importPage()

    return { Component: pageModule.default }
  }
}

/**
 * 校验并规范化应用内部跳转地址，避免跳转到登录页或外部站点
 * @param path 待校验的应用路径
 */
function normalizeAuthenticatedPath(path: string | null) {
  if (!path) {
    return null
  }

  try {
    const targetUrl = new URL(path, window.location.origin)
    if (targetUrl.origin !== window.location.origin || targetUrl.pathname === LOGIN_PATH) {
      return null
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
  } catch {
    return null
  }
}

/**
 * 记录当前标签页最后访问的已登录页面
 * @param path 已通过登录校验的应用路径
 */
function rememberAuthenticatedPath(path: string) {
  try {
    sessionStorage.setItem(LAST_AUTHENTICATED_PATH_KEY, path)
  } catch {
    // 浏览器禁用 Storage 时继续使用默认页面，不影响路由访问
  }
}

/**
 * 获取登录成功后的安全跳转地址
 * @param search 登录页查询参数
 */
export function getPostLoginPath(search: string) {
  const redirectPath = new URLSearchParams(search).get('redirect')
  return normalizeAuthenticatedPath(redirectPath) ?? DEFAULT_AUTHENTICATED_PATH
}

/**
 * 获取当前标签页最后访问的已登录页面
 */
function getLastAuthenticatedPath() {
  try {
    return (
      normalizeAuthenticatedPath(sessionStorage.getItem(LAST_AUTHENTICATED_PATH_KEY)) ??
      DEFAULT_AUTHENTICATED_PATH
    )
  } catch {
    return DEFAULT_AUTHENTICATED_PATH
  }
}

/**
 * 校验受保护页面的登录状态，未登录时携带原目标地址前往登录页
 * @param request 当前路由请求
 */
export async function requireAuthentication({ request }: LoaderFunctionArgs) {
  const targetUrl = new URL(request.url)
  const targetPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`

  if (useAuthStore.getState().accessToken) {
    rememberAuthenticatedPath(targetPath)
    await useUserStore.getState().reqLoadCurrentUser()

    if (useAuthStore.getState().accessToken) {
      return null
    }
  }

  throw redirect(`${LOGIN_PATH}?redirect=${encodeURIComponent(targetPath)}`)
}

/**
 * 阻止已登录用户重复进入登录页，站内导航时保持在当前页面
 */
export function preventRepeatedLogin() {
  if (!useAuthStore.getState().accessToken) {
    return null
  }

  throw redirect(getLastAuthenticatedPath())
}
