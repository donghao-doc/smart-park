import type { MockDataDto } from '@/types/mock-data'
import { isMockSettings } from '@/utils/mock-data'
import { createDefaultMockData } from './data/mock-data'

const MOCK_SETTINGS_KEY = 'smart-park.mock-settings.v1'

/** 读取已保存的配置，首次使用或数据损坏时恢复默认配置 */
export function getMockData(): MockDataDto {
  const raw = localStorage.getItem(MOCK_SETTINGS_KEY)
  if (raw) {
    try {
      const data: unknown = JSON.parse(raw)
      if (
        isMockSettings(data) &&
        'version' in data &&
        data.version === 'v1.0' &&
        'lastResetAt' in data &&
        (data.lastResetAt === null ||
          (typeof data.lastResetAt === 'string' && Number.isFinite(Date.parse(data.lastResetAt))))
      ) {
        return data as MockDataDto
      }
    } catch {
      // 损坏的持久化配置不能导致所有 Mock 请求失败
    }
  }

  const defaults = createDefaultMockData()
  saveMockData(defaults)
  return defaults
}

/** 将管理配置持久化到当前浏览器，写入失败时由接口返回错误 */
export function saveMockData(data: MockDataDto) {
  localStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(data))
}
