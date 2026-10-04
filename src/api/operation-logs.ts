import http from '@/http'
import type {
  OperationLogDetailDto,
  OperationLogListParams,
  OperationLogPageResult,
} from '@/types/operation-log'

/** 按人员、模块、时间和结果分页查询操作日志 */
export async function reqGetOperationLogs(params: OperationLogListParams = {}) {
  return http.get<OperationLogPageResult>('/system/operation-logs', { params })
}

/** 读取指定日志的请求快照与失败原因 */
export async function reqGetOperationLog(id: string) {
  return http.get<OperationLogDetailDto>(`/system/operation-logs/${encodeURIComponent(id)}`)
}
