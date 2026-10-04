import type { ParkingRecordStatus, ParkingVehicleType } from '@/types/parking-record'

/** 通行车型统一显示文案 */
export const parkingVehicleTypeLabels: Record<ParkingVehicleType, string> = {
  small: '小型车',
  large: '大型车',
  temporary: '临时车',
}

/** 停车状态统一显示文案 */
export const parkingStatusLabels: Record<ParkingRecordStatus, string> = {
  parked: '在场',
  departed: '已离场',
  overtime: '超时',
  unauthorized: '无权限',
}

/** 筛选表单可选车型 */
export const parkingVehicleTypeOptions = Object.entries(parkingVehicleTypeLabels).map(
  ([value, label]) => ({ value, label }),
)

/** 筛选表单可选停车状态 */
export const parkingStatusOptions = Object.entries(parkingStatusLabels).map(
  ([value, label]) => ({ value, label }),
)
