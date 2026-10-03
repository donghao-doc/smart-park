import http from '@/http'
import type {
  PersonnelDto,
  PersonnelListParams,
  PersonnelMutationRequest,
  PersonnelPageResult,
  UpdatePersonnelStatusRequest,
} from '@/types/personnel'

/**
 * 分页查询人员列表
 */
export async function reqGetPersonnelList(params: PersonnelListParams = {}) {
  return http.get<PersonnelPageResult>('/personnel', { params })
}

/**
 * 查询指定人员详情
 */
export async function reqGetPersonnel(personnelId: string) {
  return http.get<PersonnelDto>(`/personnel/${personnelId}`)
}

/**
 * 创建人员
 */
export async function reqCreatePersonnel(payload: PersonnelMutationRequest) {
  return http.post<PersonnelDto, PersonnelMutationRequest>('/personnel', payload)
}

/**
 * 更新指定人员资料
 */
export async function reqUpdatePersonnel(
  personnelId: string,
  payload: PersonnelMutationRequest,
) {
  return http.put<PersonnelDto, PersonnelMutationRequest>(
    `/personnel/${personnelId}`,
    payload,
  )
}

/**
 * 更新指定人员任职状态
 */
export async function reqUpdatePersonnelStatus(
  personnelId: string,
  payload: UpdatePersonnelStatusRequest,
) {
  return http.patch<PersonnelDto, UpdatePersonnelStatusRequest>(
    `/personnel/${personnelId}/status`,
    payload,
  )
}
