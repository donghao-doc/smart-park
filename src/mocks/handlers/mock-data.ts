import { delay, http } from 'msw'
import { isMockSettings } from '@/utils/mock-data'
import { createDefaultMockData } from '../data/mock-data'
import { getMockData, saveMockData } from '../settings'
import { resetMockState } from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/** Mock 管理接口，始终保持可用以便关闭异常模拟或恢复数据 */
export const mockDataHandlers = [
  http.get('/api/system/mock-data', async ({ request }) => {
    await delay(getMockData().responseDelay)
    const auth = authorizeRequest(request, 'mock-data:manage')
    if ('response' in auth) return auth.response
    return createSuccessResponse(getMockData())
  }),

  http.put('/api/system/mock-data', async ({ request }) => {
    await delay(getMockData().responseDelay)
    const auth = authorizeRequest(request, 'mock-data:manage')
    if ('response' in auth) return auth.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(400, 40090, '请求参数格式不正确')
    }
    if (!isMockSettings(body)) {
      return createErrorResponse(400, 40091, '请检查接口延迟范围及模块异常配置')
    }

    const data = {
      ...getMockData(),
      responseDelay: body.responseDelay,
      exceptions: body.exceptions.map(({ module, enabled, statusCode }) => ({
        module,
        enabled,
        statusCode,
      })),
    }
    try {
      saveMockData(data)
      return createSuccessResponse(data, 'Mock 设置保存成功')
    } catch {
      return createErrorResponse(500, 50090, '本地存储写入失败，请检查浏览器存储空间')
    }
  }),

  http.post('/api/system/mock-data/reset', async ({ request }) => {
    await delay(getMockData().responseDelay)
    const auth = authorizeRequest(request, 'mock-data:manage')
    if ('response' in auth) return auth.response

    const data = { ...createDefaultMockData(), lastResetAt: new Date().toISOString() }
    try {
      resetMockState()
      saveMockData(data)
      return createSuccessResponse(data, '已恢复初始数据，请重新登录')
    } catch {
      return createErrorResponse(500, 50091, '恢复初始数据失败，请检查浏览器存储空间')
    }
  }),
]
