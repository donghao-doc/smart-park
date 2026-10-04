import { Tag } from 'antd'

import type { WorkOrderPriority, WorkOrderStatus } from '@/types/work-order'
import { workOrderPriorityLabels, workOrderStatusLabels } from '@/utils/work-order'
import './work-order-tag.scss'

/** 工单状态标签，列表、详情及处理记录使用相同文案和颜色 */
export function WorkOrderStatusTag({
  status,
}: {
  /** 工单生命周期状态 */ status: WorkOrderStatus
}) {
  return (
    <Tag className={`work-order-status-tag is-${status}`} variant="filled">
      {workOrderStatusLabels[status]}
    </Tag>
  )
}

/** 高中低紧急程度标签 */
export function WorkOrderPriorityTag({
  priority,
}: {
  /** 工单优先级 */ priority: WorkOrderPriority
}) {
  return (
    <Tag className={`work-order-priority-tag is-${priority}`} variant="filled">
      {workOrderPriorityLabels[priority]}
    </Tag>
  )
}
