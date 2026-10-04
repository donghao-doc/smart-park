import { delay, http } from 'msw'
import type { MockModule } from '@/types/mock-data'
import { getMockData } from '../settings'
import { createErrorResponse } from '../utils'

/** 按接口路径识别异常模块，认证初始化接口保持可用以便恢复设置 */
function resolveMockModule(path: string): MockModule | undefined {
  if (path === '/api/auth/login') return 'login'
  if (/^\/api\/enterprises(?:\/|$)/.test(path)) return 'enterprise'
  if (/^\/api\/visitor-(appointments|records)(?:\/|$)/.test(path)) return 'visitor'
  if (/^\/api\/work-orders(?:\/|$)/.test(path)) return 'work_order'
  if (/^\/api\/devices(?:\/|$)/.test(path)) return 'device'
  return undefined
}

/** 统一应用响应延迟和异常模拟，正常请求继续交给后续业务处理器 */
export const simulationHandlers = [
  http.all('/api/*', async ({ request }) => {
    const settings = getMockData()
    await delay(settings.responseDelay)
    const module = resolveMockModule(new URL(request.url).pathname)
    const exception = settings.exceptions.find((item) => item.module === module && item.enabled)
    if (exception) {
      return createErrorResponse(
        exception.statusCode,
        exception.statusCode * 100 + 90,
        `Mock 异常模拟：接口返回 ${exception.statusCode}`,
      )
    }
    // 不返回响应时，MSW 会继续执行后续匹配的业务处理器
  }),
]
