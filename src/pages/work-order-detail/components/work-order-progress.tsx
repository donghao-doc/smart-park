import { Alert, Steps } from 'antd'

import type { WorkOrderDto, WorkOrderStatus } from '@/types/work-order'
import { formatDateTime } from '@/utils'
import { getCurrentWorkOrderHistory } from '../utils'

interface WorkOrderProgressProps {
  /** 当前工单及处理历史 */
  order: WorkOrderDto
}

const stageIndexes: Record<WorkOrderStatus, number> = {
  pending_acceptance: 0,
  pending_processing: 1,
  processing: 2,
  pending_confirmation: 3,
  completed: 3,
  cancelled: 0,
}

/** 当前处理进度，待处理归入受理节点，完成后将最后一个节点标为已完成 */
function WorkOrderProgress({ order }: WorkOrderProgressProps) {
  const history = getCurrentWorkOrderHistory(order)
  const completed = order.status === 'completed'
  const cancelled = order.status === 'cancelled'
  const previousStatus = history.filter((entry) => entry.status !== 'cancelled').at(-1)?.status
  const current = stageIndexes[cancelled ? (previousStatus ?? 'pending_acceptance') : order.status]
  const stages = [
    {
      title: history[0]?.action === 'reopen' ? '重新打开' : '工单创建',
      action: history[0]?.action,
    },
    { title: '工单受理', action: 'accept' },
    { title: '处理中', action: 'start' },
    {
      title: completed ? '已完成' : '待确认',
      action: completed ? 'confirm' : 'submit',
    },
  ]

  return (
    <>
      <Steps
        className="work-order-detail-progress"
        size="small"
        current={current}
        status={cancelled ? 'error' : completed ? 'finish' : 'process'}
        titlePlacement="vertical"
        items={stages.map((stage) => {
          const entry = history.find((item) => item.action === stage.action)
          return {
            title: stage.title,
            content: entry ? formatDateTime(entry.occurredAt) : '等待处理',
          }
        })}
      />
      {cancelled ? (
        <Alert
          className="work-order-detail-notice"
          type="warning"
          title="工单已取消，可由管理员重新打开"
        />
      ) : null}
    </>
  )
}

export default WorkOrderProgress
