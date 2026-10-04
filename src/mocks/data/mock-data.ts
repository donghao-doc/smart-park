import type { MockDataDto } from '@/types/mock-data'
import { mockModuleOptions } from '@/utils/mock-data'

/** 创建独立的默认 Mock 配置，所有模块异常默认关闭 */
export function createDefaultMockData(): MockDataDto {
  return {
    version: 'v1.0',
    lastResetAt: null,
    responseDelay: 800,
    exceptions: mockModuleOptions.map((option) => ({
      module: option.value,
      enabled: false,
      statusCode: 500,
    })),
  }
}
