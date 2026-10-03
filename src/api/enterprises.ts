import http from '@/http'
import type {
  EnterpriseDetailDto,
  EnterpriseListParams,
  EnterpriseMutationRequest,
  EnterprisePageResult,
} from '@/types/enterprise'

/**
 * 分页查询企业列表
 */
export async function reqGetEnterprises(params: EnterpriseListParams = {}) {
  return http.get<EnterprisePageResult>('/enterprises', { params })
}

/**
 * 查询指定企业详情
 */
export async function reqGetEnterprise(enterpriseId: string) {
  return http.get<EnterpriseDetailDto>(`/enterprises/${enterpriseId}`)
}

/**
 * 创建企业
 */
export async function reqCreateEnterprise(payload: EnterpriseMutationRequest) {
  return http.post<EnterpriseDetailDto, EnterpriseMutationRequest>('/enterprises', payload)
}

/**
 * 更新指定企业资料
 */
export async function reqUpdateEnterprise(
  enterpriseId: string,
  payload: EnterpriseMutationRequest,
) {
  return http.put<EnterpriseDetailDto, EnterpriseMutationRequest>(
    `/enterprises/${enterpriseId}`,
    payload,
  )
}
