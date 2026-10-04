import http from '@/http'
import type {
  UpdateVehicleStatusRequest,
  VehicleDto,
  VehicleEnterpriseOption,
  VehicleListParams,
  VehicleMutationRequest,
  VehiclePageResult,
} from '@/types/vehicle'

/** 分页查询当前账号可访问的车辆档案 */
export async function reqGetVehicles(params: VehicleListParams = {}) {
  return http.get<VehiclePageResult>('/vehicles', { params })
}

/** 查询车辆模块可选择的全部企业，企业账号仅返回所属企业 */
export async function reqGetVehicleEnterpriseOptions() {
  return http.get<VehicleEnterpriseOption[]>('/vehicles/enterprise-options')
}

/** 查询指定车辆的完整档案 */
export async function reqGetVehicle(vehicleId: string) {
  return http.get<VehicleDto>(`/vehicles/${vehicleId}`)
}

/** 登记新的车辆档案 */
export async function reqCreateVehicle(payload: VehicleMutationRequest) {
  return http.post<VehicleDto, VehicleMutationRequest>('/vehicles', payload)
}

/** 更新指定车辆的档案资料 */
export async function reqUpdateVehicle(vehicleId: string, payload: VehicleMutationRequest) {
  return http.put<VehicleDto, VehicleMutationRequest>(`/vehicles/${vehicleId}`, payload)
}

/** 启用或停用指定车辆档案 */
export async function reqUpdateVehicleStatus(
  vehicleId: string,
  payload: UpdateVehicleStatusRequest,
) {
  return http.patch<VehicleDto, UpdateVehicleStatusRequest>(
    `/vehicles/${vehicleId}/status`,
    payload,
  )
}
