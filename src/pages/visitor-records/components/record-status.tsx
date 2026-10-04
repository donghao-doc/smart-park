import { Tag } from 'antd'

import type { VisitorRecordStatus } from '@/types/visitor-record'
import './record-status.scss'

interface RecordStatusProps {
  /** 到访记录的历史状态 */
  status: VisitorRecordStatus
}

const statusLabels: Record<VisitorRecordStatus, string> = {
  checked_in: '已到访', checked_out: '已离园', expired: '已过期',
}

/** 统一列表与详情中的到访状态文案及颜色 */
function RecordStatus({ status }: RecordStatusProps) {
  return (
    <Tag className={`record-status-tag is-${status}`} variant="filled">
      {statusLabels[status]}
    </Tag>
  )
}

export default RecordStatus
