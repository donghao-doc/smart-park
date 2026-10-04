/** 可独立配置异常响应的 Mock 接口模块 */
export type MockModule = 'login' | 'enterprise' | 'visitor' | 'work_order' | 'device'

/** 异常模拟支持的 HTTP 状态码 */
export type MockErrorStatus = 400 | 401 | 403 | 404 | 408 | 429 | 500 | 502 | 503 | 504

/** 单个业务模块的异常响应配置 */
export interface MockExceptionSetting {
  /** 需要模拟异常的接口模块 */
  module: MockModule
  /** 是否拦截该模块并返回异常，不执行原业务逻辑 */
  enabled: boolean
  /** 开启异常模拟时返回的 HTTP 状态码 */
  statusCode: MockErrorStatus
}

/** 保存后应用于当前浏览器后续 Mock 请求的设置 */
export interface MockSettings {
  /** 所有 Mock 接口的响应延迟，单位毫秒，范围 0～2000 */
  responseDelay: number
  /** 五个业务模块的独立异常设置，每个模块必须且只能出现一次 */
  exceptions: MockExceptionSetting[]
}

/** Mock 管理页展示的本地数据状态及当前已保存设置 */
export interface MockDataDto extends MockSettings {
  /** 当前标准种子数据的版本标识 */
  version: string
  /** 最近一次恢复初始数据的 ISO 8601 时间，尚未重置时为空 */
  lastResetAt: string | null
}
