import type { VehicleStatus, VehicleType } from '@/types/vehicle'

/** 车辆类型的统一显示文案 */
export const vehicleTypeLabels: Record<VehicleType, string> = {
  employee: '员工车',
  visitor: '访客车',
}

/** 车辆状态的统一显示文案 */
export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: '启用',
  disabled: '停用',
}

/** 车辆筛选和登记表单使用的类型选项 */
export const vehicleTypeOptions = Object.entries(vehicleTypeLabels).map(([value, label]) => ({
  value,
  label,
}))

/** 车辆筛选和登记表单使用的状态选项 */
export const vehicleStatusOptions = Object.entries(vehicleStatusLabels).map(([value, label]) => ({
  value,
  label,
}))
