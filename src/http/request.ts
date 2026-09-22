import type { AxiosInstance } from 'axios'
import type { HttpRequestConfig } from './types'

/**
 * 页面和业务 API 可使用的类型安全 HTTP 方法集合
 */
export interface HttpClient {
  /** 使用完整配置发送请求 */
  request<T = unknown, D = unknown>(config: HttpRequestConfig<D>): Promise<T>
  /** 发送 GET 请求 */
  get<T = unknown, D = unknown>(url: string, config?: HttpRequestConfig<D>): Promise<T>
  /** 发送 POST 请求 */
  post<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>): Promise<T>
  /** 发送 PUT 请求 */
  put<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>): Promise<T>
  /** 发送 PATCH 请求 */
  patch<T = unknown, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>): Promise<T>
  /** 发送 DELETE 请求 */
  delete<T = unknown, D = unknown>(url: string, config?: HttpRequestConfig<D>): Promise<T>
}

/**
 * 基于独立 axios 实例创建返回业务数据的请求方法
 * @param instance 已注册项目拦截器的 axios 实例
 */
export function createHttpClient(instance: AxiosInstance): HttpClient {
  return {
    request: <T, D>(config: HttpRequestConfig<D>) =>
      instance.request<T, unknown, D>(config) as Promise<T>,
    get: <T, D>(url: string, config?: HttpRequestConfig<D>) =>
      instance.get<T, unknown, D>(url, config) as Promise<T>,
    post: <T, D>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
      instance.post<T, unknown, D>(url, data, config) as Promise<T>,
    put: <T, D>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
      instance.put<T, unknown, D>(url, data, config) as Promise<T>,
    patch: <T, D>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
      instance.patch<T, unknown, D>(url, data, config) as Promise<T>,
    delete: <T, D>(url: string, config?: HttpRequestConfig<D>) =>
      instance.delete<T, unknown, D>(url, config) as Promise<T>,
  }
}
