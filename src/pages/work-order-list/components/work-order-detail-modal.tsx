import { FileImageOutlined } from '@ant-design/icons'
import { Alert, Button, Descriptions, Divider, Flex, Modal, Rate, Skeleton, Tag, Timeline } from 'antd'

import type { WorkOrderDto } from '@/types/work-order'
import { formatDateTime, maskPhoneNumber } from '@/utils'
import { workOrderActionLabels, workOrderTypeLabels } from '@/utils/work-order'
import { WorkOrderPriorityTag, WorkOrderStatusTag } from './work-order-tag'
import './work-order-detail-modal.scss'

interface WorkOrderDetailModalProps {
  /** 是否打开工单详情 */
  open: boolean
  /** 接口返回的完整工单 */
  order?: WorkOrderDto
  /** 是否正在加载详情 */
  loading: boolean
  /** 详情接口是否失败 */
  loadError: boolean
  /** 重新加载当前工单详情 */
  onRetry: () => void
  /** 关闭工单详情 */
  onClose: () => void
}

/** 展示工单基本资料、图片占位、评价及按时间排序的完整流程记录 */
function WorkOrderDetailModal({
  open,
  order,
  loading,
  loadError,
  onRetry,
  onClose,
}: WorkOrderDetailModalProps) {
  return (
    <Modal
      className="work-order-detail-modal"
      open={open}
      title="工单详情"
      width={820}
      footer={<Button onClick={onClose}>关闭</Button>}
      destroyOnHidden
      onCancel={onClose}
    >
      {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : loadError ? (
        <Alert
          type="error"
          showIcon
          title="工单详情加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : order ? (
        <>
          <Flex
            align="center"
            justify="space-between"
            gap={12}
            wrap
          >
            <h3 className="work-order-detail-title">{order.title}</h3>
            <WorkOrderStatusTag status={order.status} />
          </Flex>
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            items={[
              { key: 'code', label: '工单编号', children: order.code },
              { key: 'type', label: '工单类型', children: workOrderTypeLabels[order.type] },
              { key: 'enterprise', label: '所属企业', children: order.enterpriseName },
              { key: 'priority', label: '紧急程度', children: <WorkOrderPriorityTag priority={order.priority} /> },
              { key: 'contact', label: '企业联系人', children: order.contactName },
              { key: 'phone', label: '联系电话', children: maskPhoneNumber(order.contactPhone) },
              { key: 'location', label: '问题位置', children: order.location },
              { key: 'assignee', label: '处理人', children: order.assigneeName ?? '尚未分派' },
              { key: 'creator', label: '提交人', children: order.creatorName },
              { key: 'createdAt', label: '提交时间', children: formatDateTime(order.createdAt) },
            ]}
          />
          <Divider />
          <h4 className="work-order-detail-heading">问题描述</h4>
          <p className="work-order-detail-description">{order.description}</p>
          {order.imageNames.length ? (
            <>
              <h4 className="work-order-detail-heading">图片占位</h4>
              <Flex gap={8} wrap>
                {order.imageNames.map((name, index) => (
                  <Tag key={`${name}-${index}`} icon={<FileImageOutlined />}>{name}</Tag>
                ))}
              </Flex>
            </>
          ) : null}
          {order.status === 'completed' ? (
            <>
              <Divider />
              <h4 className="work-order-detail-heading">企业评价</h4>
              {order.rating ? <Rate disabled value={order.rating} /> : <span>已确认，未评分</span>}
              {order.feedback ? <p className="work-order-detail-description">{order.feedback}</p> : null}
            </>
          ) : null}
          <Divider />
          <h4 className="work-order-detail-heading">处理记录</h4>
          <Timeline
            items={order.history.map((entry) => ({
              key: entry.id,
              color: entry.status === 'cancelled' ? 'red' : entry.status === 'completed' ? 'green' : 'blue',
              content: (
                <div>
                  <Flex align="center" gap={12} wrap>
                    <strong>{workOrderActionLabels[entry.action]}</strong>
                    <span className="work-order-history-meta">
                      {entry.operatorName} · {formatDateTime(entry.occurredAt)}
                    </span>
                  </Flex>
                  <p className="work-order-history-remark">{entry.remark}</p>
                </div>
              ),
            }))}
          />
        </>
      ) : null}
    </Modal>
  )
}

export default WorkOrderDetailModal
