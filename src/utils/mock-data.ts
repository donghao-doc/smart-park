import type { MockErrorStatus, MockModule, MockSettings } from '@/types/mock-data'

/** 异常模拟模块的展示名称和接口范围 */
export const mockModuleOptions: {
  /** 接口模块的稳定标识 */
  value: MockModule
  /** 设计稿中的模块名称 */
  label: string
  /** 对应业务接口的说明 */
  description: string
}[] = [
  { value: 'login', label: 'Login', description: '登录认证相关接口' },
  { value: 'enterprise', label: 'Enterprise', description: '企业管理相关接口' },
  { value: 'visitor', label: 'Visitor', description: '访客管理相关接口' },
  { value: 'work_order', label: 'Work Order', description: '工单管理相关接口' },
  { value: 'device', label: 'Device', description: '设备管理相关接口' },
]

/** 允许模拟的 HTTP 错误码，包含客户端错误、限流和服务端错误 */
export const mockErrorStatuses: MockErrorStatus[] = [
  400, 401, 403, 404, 408, 429, 500, 502, 503, 504,
]

/** 校验延迟范围及完整模块设置，防止损坏的本地配置影响正常请求 */
export function isMockSettings(value: unknown): value is MockSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<MockSettings>
  if (
    !Number.isInteger(settings.responseDelay) ||
    settings.responseDelay! < 0 ||
    settings.responseDelay! > 2000 ||
    !Array.isArray(settings.exceptions) ||
    settings.exceptions.length !== mockModuleOptions.length
  ) {
    return false
  }

  return mockModuleOptions.every(
    (option) =>
      settings.exceptions!.filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          item.module === option.value &&
          typeof item.enabled === 'boolean' &&
          mockErrorStatuses.includes(item.statusCode),
      ).length === 1,
  )
}
