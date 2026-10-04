import { Badge, Flex, Tag } from 'antd'

import type { ParkingRecordStatus } from '@/types/parking-record'
import { parkingStatusLabels } from '../parking-options'
import './parking-status.scss'

interface ParkingStatusProps {
  /** 停车通行状态 */
  status: ParkingRecordStatus
}

const statusColors: Record<ParkingRecordStatus, string> = {
  parked: '#00ac8b',
  departed: '#8592b0',
  overtime: '#f04455',
  unauthorized: '#fa9b00',
}

/** 统一停车列表与详情中的圆点和状态标签 */
function ParkingStatus({ status }: ParkingStatusProps) {
  return (
    <Flex align="center" gap={8} className="parking-status">
      <Badge color={statusColors[status]} />
      <Tag className={`parking-status-tag is-${status}`} variant="filled">
        {parkingStatusLabels[status]}
      </Tag>
    </Flex>
  )
}

export default ParkingStatus
