import { Tag } from 'antd'

import type { DeviceStatus } from '@/types/device'
import { deviceStatusLabels } from '@/utils/device'
import './device-status.scss'

interface DeviceStatusTagProps {
  /** 当前运行状态 */
  status: DeviceStatus
}

/** 使用统一的颜色和文案展示设备运行状态 */
function DeviceStatusTag({ status }: DeviceStatusTagProps) {
  return (
    <Tag className={`device-status is-${status}`} variant="filled">
      {deviceStatusLabels[status]}
    </Tag>
  )
}

export default DeviceStatusTag
