import http from '@/http'
import type { MockDataDto, MockSettings } from '@/types/mock-data'

/** 读取当前浏览器的 Mock 状态与已保存设置 */
export async function reqGetMockData() {
  return http.get<MockDataDto>('/system/mock-data')
}

/** 保存统一接口延迟与各模块异常设置 */
export async function reqUpdateMockSettings(settings: MockSettings) {
  return http.put<MockDataDto>('/system/mock-data', settings)
}

/** 恢复标准种子数据和默认配置，并清除所有模拟登录会话 */
export async function reqResetMockData() {
  return http.post<MockDataDto>('/system/mock-data/reset')
}
