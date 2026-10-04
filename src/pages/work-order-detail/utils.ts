import type { WorkOrderDto } from '@/types/work-order'

/** 获取当前一轮处理流程，重新打开后不沿用上一轮的状态时间和处理结果 */
export function getCurrentWorkOrderHistory(order: WorkOrderDto) {
  const startIndex = order.history.findLastIndex((entry) => entry.action === 'reopen')
  return order.history.slice(Math.max(0, startIndex))
}

/** 从当前一轮历史提取处理结果，避免持久化可稳定计算的冗余字段 */
export function getWorkOrderResult(order: WorkOrderDto) {
  return getCurrentWorkOrderHistory(order).findLast((entry) => entry.action === 'submit')?.remark
}
