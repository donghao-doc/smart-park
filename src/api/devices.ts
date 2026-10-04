import http from '@/http'
import type {
  DeviceDetailDto,
  DeviceListParams,
  DeviceMutationRequest,
  DevicePageResult,
  DeviceSummaryDto,
} from '@/types/device'

/** 分页查询设备档案，支持名称、编码、分类、位置和状态组合筛选 */
export async function reqGetDevices(params: DeviceListParams = {}) {
  return http.get<DevicePageResult>('/devices', { params })
}

/** 查询全园区设备状态统计 */
export async function reqGetDeviceSummary() {
  return http.get<DeviceSummaryDto>('/devices/summary')
}

/** 查询已登记设备的位置选项 */
export async function reqGetDeviceLocations() {
  return http.get<string[]>('/devices/locations')
}

/** 获取设备基本信息和最近状态变化记录 */
export async function reqGetDevice(id: string) {
  return http.get<DeviceDetailDto>(`/devices/${id}`)
}

/** 登记设备档案，编码必须唯一 */
export async function reqCreateDevice(payload: DeviceMutationRequest) {
  return http.post<DeviceDetailDto, DeviceMutationRequest>('/devices', payload)
}

/** 更新设备档案，状态变化由服务端追加记录 */
export async function reqUpdateDevice(id: string, payload: DeviceMutationRequest) {
  return http.put<DeviceDetailDto, DeviceMutationRequest>(`/devices/${id}`, payload)
}
