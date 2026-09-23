import axios, { AxiosHeaders, type AxiosResponse } from 'axios'
import { useAuthStore } from '../stores/auth'
import { handleHttpError, rejectHttpError } from './error-handler'
import { createHttpClient } from './request'
import { isApiResponse } from './types'

const API_SUCCESS_CODE = 0

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || '/api',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    config.headers = AxiosHeaders.from(config.headers)
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

axiosInstance.interceptors.response.use((response) => {
  const responseData: unknown = response.data

  if (!isApiResponse(responseData)) {
    return responseData as AxiosResponse
  }

  if (responseData.code === API_SUCCESS_CODE) {
    return responseData.data as AxiosResponse
  }

  handleHttpError({
    value: responseData,
    status: responseData.code === 401 || responseData.code === 403 ? responseData.code : undefined,
    config: response.config,
  })
  return Promise.reject(responseData)
}, rejectHttpError)

/** 项目统一 HTTP 请求对象，调用成功后直接返回解包后的业务数据 */
const http = createHttpClient(axiosInstance)

/** 使用完整配置发送请求 */
export const request = http.request
/** 发送 GET 请求 */
export const get = http.get
/** 发送 POST 请求 */
export const post = http.post
/** 发送 PUT 请求 */
export const put = http.put
/** 发送 PATCH 请求 */
export const patch = http.patch
/** 发送 DELETE 请求 */
export const del = http.delete
/** 发送 DELETE 请求 */
export { del as delete }

export { isApiResponse }
export type { HttpClient } from './request'
export type { ApiResponse, HttpRequestConfig } from './types'
export default http
