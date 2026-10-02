import http from '../http'
import type {
  ParkProfileDto,
  ParkSpaceListDto,
  ParkSpaceListParams,
  UpdateParkInfoRequest,
} from '../types/park-profile'

/**
 * 查询园区基础信息、空间指标和楼宇树
 */
export async function reqGetParkProfile() {
  return http.get<ParkProfileDto>('/park/profile')
}

/**
 * 更新园区基础信息
 */
export async function reqUpdateParkProfile(data: UpdateParkInfoRequest) {
  return http.put<ParkProfileDto, UpdateParkInfoRequest>('/park/profile', data)
}

/**
 * 分页查询园区空间明细
 */
export async function reqGetParkSpaces(params: ParkSpaceListParams) {
  return http.get<ParkSpaceListDto>('/park/spaces', { params })
}
