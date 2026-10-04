import { Col, Row, Timeline } from 'antd'

import type { WorkOrderDto } from '@/types/work-order'
import { formatDateTime } from '@/utils'
import { workOrderActionLabels } from '@/utils/work-order'

interface WorkOrderHistoryProps {
  /** 保存全部处理轮次的工单资料 */
  order: WorkOrderDto
}

/** 按接口时间顺序展示全部处理记录，包括取消和重新打开的说明 */
function WorkOrderHistory({ order }: WorkOrderHistoryProps) {
  return (
    <Timeline
      className="work-order-detail-history"
      items={order.history.map((entry) => ({
        key: entry.id,
        color:
          entry.status === 'cancelled' ? 'orange' : entry.status === 'completed' ? 'green' : 'blue',
        content: (
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8} xl={6}>
              <time className="work-order-detail-history-time" dateTime={entry.occurredAt}>
                {formatDateTime(entry.occurredAt)}
              </time>
            </Col>
            <Col xs={24} md={16} xl={8}>
              <strong>{workOrderActionLabels[entry.action]}</strong>
              <p className="work-order-detail-secondary">{entry.operatorName}</p>
            </Col>
            <Col xs={24} xl={10}>
              <p className="work-order-detail-history-remark">{entry.remark}</p>
            </Col>
          </Row>
        ),
      }))}
    />
  )
}

export default WorkOrderHistory
