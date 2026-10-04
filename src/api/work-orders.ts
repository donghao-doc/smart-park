import http from '@/http'
import type {
  WorkOrderActionRequest,
  WorkOrderCreateRequest,
  WorkOrderDto,
  WorkOrderImageDto,
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

/** 模拟上传图片，文件由 MSW 在浏览器内处理，不发送到远端 */
export async function reqUploadWorkOrderImage(file: File) {
  const data = new FormData()
  data.append('file', file)
  return http.post<WorkOrderImageDto, FormData>('/work-orders/images', data)
}

/** 使用本地示例图片完成模拟上传，便于无需文件即可演示附件流程 */
export async function reqUploadWorkOrderSampleImage(sampleIndex: number) {
  return http.post<WorkOrderImageDto>('/work-orders/images/sample', { sampleIndex })
}

/** 保存工单现场图片，服务端限制最多 5 张并校验可修改状态 */
export async function reqUpdateWorkOrderImages(id: string, images: WorkOrderImageDto[]) {
  return http.patch<WorkOrderDto>(`/work-orders/${id}/images`, { images })
}
