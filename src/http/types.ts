import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types/api'

/**
 * HTTP 请求的项目级扩展配置
 */
export interface HttpRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  /** 是否关闭本次请求的全局错误提示 */
  skipErrorMessage?: boolean
  /** 是否关闭本次请求发生 401/403 时的自动跳转 */
  skipAuthRedirect?: boolean
}

/**
 * 判断未知数据是否符合后端统一响应结构
 * @param value 待判断的数据
 */
export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const response = value as Partial<ApiResponse<T>>
  return (
    typeof response.code === 'number' &&
    typeof response.message === 'string' &&
    Object.prototype.hasOwnProperty.call(response, 'data')
  )
}

export type { ApiResponse }
