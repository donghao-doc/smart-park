import http from '@/http'
import type {
  WorkOrderActionRequest,
  WorkOrderCreateRequest,
  WorkOrderDto,
  WorkOrderListParams,
  WorkOrderMetricDto,
  WorkOrderOptionsDto,
  WorkOrderPageResult,
} from '@/types/work-order'

/** 分页查询当前账号可见的工单 */
export async function reqGetWorkOrders(params: WorkOrderListParams = {}) {
  return http.get<WorkOrderPageResult>('/work-orders', { params })
}

/** 查询五项工单状态统计和上周比较值 */
export async function reqGetWorkOrderSummary() {
  return http.get<WorkOrderMetricDto[]>('/work-orders/summary')
}

/** 查询工单表单的完整企业和处理人选项 */
export async function reqGetWorkOrderOptions() {
  return http.get<WorkOrderOptionsDto>('/work-orders/options')
}

/** 查询工单资料和完整处理历史 */
export async function reqGetWorkOrder(id: string) {
  return http.get<WorkOrderDto>(`/work-orders/${id}`)
}

/** 创建待受理工单 */
export async function reqCreateWorkOrder(payload: WorkOrderCreateRequest) {
  return http.post<WorkOrderDto, WorkOrderCreateRequest>('/work-orders', payload)
}

/** 执行工单状态流转或重新分派 */
export async function reqUpdateWorkOrder(id: string, payload: WorkOrderActionRequest) {
  return http.patch<WorkOrderDto, WorkOrderActionRequest>(`/work-orders/${id}/actions`, payload)
}
