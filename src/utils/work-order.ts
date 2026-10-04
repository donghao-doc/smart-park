import type { PermissionCode } from '@/types/auth'
import type {
  WorkOrderAction,
  WorkOrderDto,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderType,
} from '@/types/work-order'

/** 工单服务分类的显示文案 */
export const workOrderTypeLabels: Record<WorkOrderType, string> = {
  repair: '报修',
  cleaning: '保洁',
  complaint: '投诉',
  other: '其他',
}

/** 工单状态的显示文案 */
export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  pending_acceptance: '待受理',
  pending_processing: '待处理',
  processing: '处理中',
  pending_confirmation: '待确认',
  completed: '已完成',
  cancelled: '已取消',
}

/** 工单紧急程度的显示文案 */
export const workOrderPriorityLabels: Record<WorkOrderPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

/** 工单动作的显示文案 */
export const workOrderActionLabels: Record<WorkOrderAction | 'create', string> = {
  create: '创建工单',
  accept: '受理并分派',
  assign: '重新分派',
  start: '开始处理',
  submit: '提交处理结果',
  confirm: '确认完成',
  cancel: '取消工单',
  reopen: '重新打开',
}

/** 校验服务分类是否属于首期支持的业务类型 */
export function isWorkOrderType(value: unknown): value is WorkOrderType {
  return typeof value === 'string' && Object.hasOwn(workOrderTypeLabels, value)
}

/** 校验工单生命周期状态 */
export function isWorkOrderStatus(value: unknown): value is WorkOrderStatus {
  return typeof value === 'string' && Object.hasOwn(workOrderStatusLabels, value)
}

/** 校验工单处理优先级 */
export function isWorkOrderPriority(value: unknown): value is WorkOrderPriority {
  return typeof value === 'string' && Object.hasOwn(workOrderPriorityLabels, value)
}

/** 统一计算流程可用操作，处理结果仅允许当前处理人或具备管理员权限的账号提交 */
export function getWorkOrderActions(
  order: WorkOrderDto,
  permissions: PermissionCode[],
  userId: string,
): WorkOrderAction[] {
  const actions: WorkOrderAction[] = []
  const canProcess = permissions.includes('work-order:process')
  const canHandle = canProcess && (
    order.assigneeId === userId || permissions.includes('work-order:reopen')
  )
  if (canProcess && order.status === 'pending_acceptance') actions.push('accept')
  if (canProcess && (order.status === 'pending_processing' || order.status === 'processing')) {
    actions.push('assign')
  }
  if (canHandle && order.status === 'pending_processing') actions.push('start')
  if (canHandle && order.status === 'processing') actions.push('submit')
  if (
    permissions.includes('work-order:confirm') && order.status === 'pending_confirmation' &&
    order.assigneeId !== userId
  ) {
    actions.push('confirm')
  }
  if (
    permissions.includes('work-order:cancel') && order.status !== 'completed' &&
    order.status !== 'cancelled'
  ) {
    actions.push('cancel')
  }
  if (
    permissions.includes('work-order:reopen') &&
    (order.status === 'completed' || order.status === 'cancelled')
  ) {
    actions.push('reopen')
  }
  return actions
}

/** 未归档的工单可由具备创建或处理权限的账号维护图片，企业范围仍由接口校验 */
export function canEditWorkOrderImages(order: WorkOrderDto, permissions: PermissionCode[]) {
  return order.status !== 'completed' && order.status !== 'cancelled' &&
    (permissions.includes('work-order:create') || permissions.includes('work-order:process'))
}
