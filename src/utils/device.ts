import type { DeviceStatus, DeviceType } from '@/types/device'

/** 设备业务分类的中文名称 */
export const deviceTypeLabels: Record<DeviceType, string> = {
  camera: '视频监控',
  access: '门禁设备',
  parking: '停车设备',
  environment: '环境监测',
  broadcast: '广播设备',
  fire: '消防设备',
  energy: '能耗设备',
}

/** 设备运行状态的中文名称 */
export const deviceStatusLabels: Record<DeviceStatus, string> = {
  normal: '正常',
  fault: '故障',
  offline: '离线',
  disabled: '停用',
}

/** 设备分类筛选和表单共用选项 */
export const deviceTypeOptions = Object.entries(deviceTypeLabels).map(([value, label]) => ({
  value,
  label,
}))

/** 设备状态筛选和表单共用选项 */
export const deviceStatusOptions = Object.entries(deviceStatusLabels).map(([value, label]) => ({
  value,
  label,
}))

/** 设备编码仅允许字母、数字、连字符和下划线，长度为 3～30 */
export const deviceCodePattern = /^[A-Z0-9][A-Z0-9_-]{2,29}$/

/** 统一设备编码大小写和首尾空格，确保唯一性校验一致 */
export function normalizeDeviceCode(value: string): string {
  return value.trim().toUpperCase()
}

/** 校验接口输入的设备业务类型 */
export function isDeviceType(value: unknown): value is DeviceType {
  return typeof value === 'string' && Object.hasOwn(deviceTypeLabels, value)
}

/** 校验接口输入的设备运行状态 */
export function isDeviceStatus(value: unknown): value is DeviceStatus {
  return typeof value === 'string' && Object.hasOwn(deviceStatusLabels, value)
}
