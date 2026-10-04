import { Tag } from 'antd'

import type { VehicleStatus, VehicleType } from '@/types/vehicle'
import { vehicleStatusLabels, vehicleTypeLabels } from '../vehicle-options'
import './vehicle-tag.scss'

interface VehicleTagProps {
  /** 车辆类型或启停状态 */
  value: VehicleType | VehicleStatus
}

/** 在列表和详情中统一展示车辆类型及状态的语义颜色 */
function VehicleTag({ value }: VehicleTagProps) {
  const label = value === 'employee' || value === 'visitor'
    ? vehicleTypeLabels[value]
    : vehicleStatusLabels[value]

  return (
    <Tag className={`vehicle-tag is-${value}`} variant="filled">
      {label}
    </Tag>
  )
}

export default VehicleTag
