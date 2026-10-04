import { delay, http } from 'msw'
import type { DashboardTrendRange } from '@/types/dashboard'
import {
  dashboardMetrics,
  dashboardTasks,
  deviceStatuses,
  visitorTrendData,
  workOrderTrendData,
} from '../data/dashboard'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  mockResponseDelay,
} from '../utils'

/**
 * 解析 Dashboard 趋势范围并筛选对应日期数据
 */
function filterTrendData<T extends { date: string }>(request: Request, source: T[]) {
  const url = new URL(request.url)
  const range = url.searchParams.get('range') as DashboardTrendRange | null

  if (range !== '7d' && range !== '30d' && range !== 'custom') {
    return { error: createErrorResponse(400, 40020, '趋势查询范围不正确') }
  }

  if (range === '7d') {
    return { data: source.slice(-7) }
  }

  if (range === '30d') {
    return { data: source.slice(-30) }
  }

  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  if (!startDate || !endDate || startDate > endDate) {
    return {
      error: createErrorResponse(400, 40021, '请选择有效的自定义日期范围'),
    }
  }

  return {
    data: source.filter((item) => item.date >= startDate && item.date <= endDate),
  }
}

/**
 * Dashboard 模拟接口，按区域拆分以支持独立加载和异常处理
 */
export const dashboardHandlers = [
  http.get('/api/dashboard/summary', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'dashboard:view')
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse({
      metrics: dashboardMetrics.map((metric) => ({ ...metric })),
    })
  }),

  http.get('/api/dashboard/visitor-trend', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'dashboard:view')
    if ('response' in auth) {
      return auth.response
    }

    const result = filterTrendData(request, visitorTrendData)
    return 'error' in result ? result.error : createSuccessResponse(result.data)
  }),

  http.get('/api/dashboard/work-order-trend', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'dashboard:view')
    if ('response' in auth) {
      return auth.response
    }

    const result = filterTrendData(request, workOrderTrendData)
    return 'error' in result ? result.error : createSuccessResponse(result.data)
  }),

  http.get('/api/dashboard/tasks', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'dashboard:view')
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse(dashboardTasks.map((task) => ({ ...task })))
  }),

  http.get('/api/dashboard/device-statuses', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'dashboard:view')
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse(deviceStatuses.map((status) => ({ ...status })))
  }),
]
