import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { redirectOnce, showErrorMessage } from './runtime'
import { isApiResponse, type HttpRequestConfig } from './types'

const LOGIN_API_PATH = '/auth/login'
const LOGIN_PAGE_PATH = '/login'
const FORBIDDEN_PAGE_PATH = '/403'

const HTTP_STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: '请求参数错误',
  401: '登录状态已失效，请重新登录',
  403: '当前账号无权执行此操作',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  409: '请求发生冲突，请刷新后重试',
  422: '请求参数校验失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关响应异常',
  503: '服务暂时不可用',
  504: '网关响应超时',
}

interface ErrorPayload {
  /** 后端响应数据或原始错误 */
  value: unknown
  /** HTTP 状态码或可识别的业务鉴权状态码 */
  status?: number
  /** 当前请求的项目级配置 */
  config?: HttpRequestConfig
}

/**
 * 从非统一响应结构中提取可展示的后端错误消息
 * @param value 后端响应数据
 */
function getMessageFromValue(value: unknown) {
  if (!value || typeof value !== 'object' || !('message' in value)) {
    return undefined
  }

  const message = value.message
  return typeof message === 'string' && message.trim() ? message : undefined
}

/**
 * 按后端消息、HTTP 状态和异常类型的优先级生成提示文案
 * @param payload 错误上下文
 */
function resolveErrorMessage({ value, status }: ErrorPayload) {
  if (isApiResponse(value) && value.message.trim()) {
    return value.message
  }

  if (!axios.isAxiosError(value)) {
    const responseMessage = getMessageFromValue(value)
    if (responseMessage) {
      return responseMessage
    }
  }

  if (status && HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status]
  }

  if (axios.isAxiosError(value)) {
    if (value.code === 'ECONNABORTED' || value.code === 'ETIMEDOUT') {
      return '请求超时，请稍后重试'
    }
    if (!value.response) {
      return '网络连接异常，请检查网络后重试'
    }
  }

  return '请求失败，请稍后重试'
}

/**
 * 判断当前错误是否来自登录接口，避免登录失败时误清理会话或跳转异常页
 * @param config 当前请求配置
 */
function isLoginRequest(config?: HttpRequestConfig) {
  if (!config?.url) {
    return false
  }

  try {
    const url = new URL(config.url, window.location.origin)
    return url.pathname.endsWith(LOGIN_API_PATH)
  } catch {
    return config.url.includes(LOGIN_API_PATH)
  }
}

/**
 * 生成携带当前页面地址的登录页路由
 */
function createLoginTarget() {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return `${LOGIN_PAGE_PATH}?redirect=${encodeURIComponent(currentPath)}`
}

/**
 * 执行统一鉴权副作用，skipAuthRedirect 不影响失效会话清理
 * @param status HTTP 状态码或业务鉴权状态码
 * @param config 当前请求配置
 */
function handleAuthStatus(status: number | undefined, config?: HttpRequestConfig) {
  if (status === 401 && !isLoginRequest(config)) {
    useAuthStore.getState().clearSession()
    if (!config?.skipAuthRedirect && window.location.pathname !== LOGIN_PAGE_PATH) {
      redirectOnce(createLoginTarget())
    }
    return
  }

  if (
    status === 403 &&
    !isLoginRequest(config) &&
    !config?.skipAuthRedirect &&
    window.location.pathname !== FORBIDDEN_PAGE_PATH
  ) {
    redirectOnce(FORBIDDEN_PAGE_PATH)
  }
}

/**
 * 统一处理业务错误与 HTTP 错误需要触发的提示和鉴权副作用
 * @param payload 错误上下文
 */
export function handleHttpError(payload: ErrorPayload) {
  handleAuthStatus(payload.status, payload.config)

  if (!payload.config?.skipErrorMessage) {
    showErrorMessage(resolveErrorMessage(payload))
  }
}

/**
 * 处理 axios 拒绝响应，并保留调用方需要识别的原始错误形态
 * @param error axios 或运行时抛出的异常
 */
export function rejectHttpError(error: unknown) {
  if (axios.isCancel(error)) {
    return Promise.reject(error)
  }

  if (axios.isAxiosError(error)) {
    const config = error.config as HttpRequestConfig | undefined
    const responseData: unknown = error.response?.data
    handleHttpError({
      value: responseData ?? error,
      status: error.response?.status,
      config,
    })

    return Promise.reject(isApiResponse(responseData) ? responseData : error)
  }

  handleHttpError({ value: error })
  return Promise.reject(error)
}
