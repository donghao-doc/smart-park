import { Alert, Button, Descriptions, Modal, Skeleton } from 'antd'

import type { VisitorRecordDto } from '@/types/visitor-record'
import { formatDateTime } from '@/utils'
import RecordStatus from './record-status'
import './record-detail-modal.scss'

interface RecordDetailModalProps {
  /** 是否展示详情弹窗 */
  open: boolean
  /** 接口返回的记录详情 */
  record?: VisitorRecordDto
  /** 详情是否正在加载 */
  loading: boolean
  /** 详情请求是否失败 */
  loadError: boolean
  /** 重试当前记录详情 */
  onRetry: () => void
  /** 关闭详情弹窗 */
  onClose: () => void
}

/** 展示访客、预约及进出园信息，保留加载和失败重试状态 */
function RecordDetailModal({ open, record, loading, loadError, onRetry, onClose }: RecordDetailModalProps) {
  return (
    <Modal className="record-detail-modal" title="到访记录详情" open={open} width={720} footer={<Button onClick={onClose}>关闭</Button>} onCancel={onClose} destroyOnHidden>
      {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : loadError ? (
        <Alert type="error" showIcon title="到访详情加载失败" action={<Button size="small" onClick={onRetry}>重试</Button>} />
      ) : record ? (
        <Descriptions bordered column={{ xs: 1, sm: 2 }} items={[
          { key: 'code', label: '预约编号', children: record.code },
          { key: 'status', label: '到访状态', children: <RecordStatus status={record.status} /> },
          { key: 'visitor', label: '访客姓名', children: record.visitorName },
          { key: 'phone', label: '手机号', children: record.visitorPhone },
          { key: 'host', label: '受访人', children: record.hostName },
          { key: 'plate', label: '车牌号', children: record.plateNumber ?? '未驾车' },
          { key: 'enterprise', label: '所属企业', children: record.enterpriseName, span: 'filled' },
          { key: 'scheduledStart', label: '预约开始', children: formatDateTime(record.scheduledStartAt) },
          { key: 'scheduledEnd', label: '预约结束', children: formatDateTime(record.scheduledEndAt) },
          { key: 'checkIn', label: '签到时间', children: record.checkedInAt ? formatDateTime(record.checkedInAt) : '未签到' },
          { key: 'checkOut', label: '签出时间', children: record.checkedOutAt ? formatDateTime(record.checkedOutAt) : record.status === 'checked_in' ? '尚未离园' : '-' },
          { key: 'reason', label: '来访事由', children: record.visitReason, span: 'filled' },
        ]} />
      ) : null}
    </Modal>
  )
}

export default RecordDetailModal
