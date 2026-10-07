import { http } from 'msw'

import type { OperationLogDetailDto, OperationLogDto } from '@/types/operation-log'
import { operationLogModuleLabels, operationLogResultLabels } from '@/utils/operation-log'
import { seedOperationLogs } from '../data/operation-logs'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/** 校验正整数分页参数，省略时使用默认值 */
function parsePage(value: string | null, fallback: number) {
  if (value === null) return fallback
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? Number(value)
    : null
}

/** 校验 UTC ISO 时间，拒绝被 Date 自动纠正的无效日期 */
function isValidTime(value: string | null) {
  if (value === null) return true
  const date = new Date(value)
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString() === value
  )
}

/** 列表只传输摘要，原始请求信息通过独立详情接口读取 */
function toLogDto(log: OperationLogDetailDto): OperationLogDto {
  return {
    id: log.id,
    operatedAt: log.operatedAt,
    operatorName: log.operatorName,
    roleName: log.roleName,
    module: log.module,
    action: log.action,
    objectName: log.objectName,
    ipAddress: log.ipAddress,
    result: log.result,
  }
}

/** 操作日志只读接口，列表和详情均要求日志查看权限 */
export const operationLogHandlers = [
  http.get('/api/system/operation-logs', async ({ request }) => {
    const auth = authorizeRequest(request, 'operation-log:view')
    if ('response' in auth) return auth.response

    const params = new URL(request.url).searchParams
    const page = parsePage(params.get('page'), 1)
    const pageSize = parsePage(params.get('pageSize'), 20)
    const operatorName = params.get('operatorName')?.trim().toLowerCase()
    const module = params.get('module')
    const result = params.get('result')
    const startTime = params.get('startTime')
    const endTime = params.get('endTime')

    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 400120, '分页参数不正确，每页最多查询 100 条')
    }
    if (module && !Object.hasOwn(operationLogModuleLabels, module)) {
      return createErrorResponse(400, 400121, '日志模块筛选条件不正确')
    }
    if (result && !Object.hasOwn(operationLogResultLabels, result)) {
      return createErrorResponse(400, 400122, '操作结果筛选条件不正确')
    }
    if (
      !isValidTime(startTime) ||
      !isValidTime(endTime) ||
      (startTime && endTime && Date.parse(startTime) > Date.parse(endTime))
    ) {
      return createErrorResponse(400, 400123, '请选择有效的操作时间范围')
    }

    const logs = [...seedOperationLogs, ...auth.state.authorizationLogs]
      .filter(
        (log) =>
          (!operatorName || log.operatorName.toLowerCase().includes(operatorName)) &&
          (!module || log.module === module) &&
          (!result || log.result === result) &&
          (!startTime || Date.parse(log.operatedAt) >= Date.parse(startTime)) &&
          (!endTime || Date.parse(log.operatedAt) <= Date.parse(endTime)),
      )
      .sort((a, b) => Date.parse(b.operatedAt) - Date.parse(a.operatedAt))
    const start = (page - 1) * pageSize

    return createSuccessResponse({
      list: logs.slice(start, start + pageSize).map(toLogDto),
      total: logs.length,
      page,
      pageSize,
    })
  }),
  http.get('/api/system/operation-logs/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'operation-log:view')
    if ('response' in auth) return auth.response

    const log = [...seedOperationLogs, ...auth.state.authorizationLogs].find(
      (item) => item.id === params.id,
    )
    if (!log) return createErrorResponse(404, 404120, '操作日志不存在')
    return createSuccessResponse(log)
  }),
]
