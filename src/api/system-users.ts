import type { UserDto } from '@/types/auth'
import type {
  CreateUserRequest,
  AssignUserRoleRequest,
  ResetPasswordResult,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserListParams,
  UserEnterpriseOptionDto,
  UserPageResult,
} from '@/types/system-user'
import http from '@/http'
import { notifyAccessChanged } from '@/utils/access-events'

/**
 * 分页查询系统用户
 */
export async function reqGetUsers(params: UserListParams = {}) {
  return http.get<UserPageResult>('/system/users', { params })
}

/**
 * 查询指定系统用户详情
 */
export async function reqGetUser(userId: string) {
  return http.get<UserDto>(`/system/users/${userId}`)
}

/**
 * 创建系统用户
 */
export async function reqCreateUser(payload: CreateUserRequest) {
  return http.post<UserDto, CreateUserRequest>('/system/users', payload)
}

/**
 * 更新指定系统用户资料
 */
export async function reqUpdateUser(userId: string, payload: UpdateUserRequest) {
  const user = await http.put<UserDto, UpdateUserRequest>(`/system/users/${userId}`, payload)
  notifyAccessChanged()
  return user
}

/**
 * 启用或停用指定系统用户
 */
export async function reqUpdateUserStatus(userId: string, payload: UpdateUserStatusRequest) {
  return http.patch<UserDto, UpdateUserStatusRequest>(`/system/users/${userId}/status`, payload)
}

/**
 * 重置指定用户的模拟密码，并使其现有会话失效
 */
export async function reqResetUserPassword(userId: string) {
  return http.post<ResetPasswordResult>(`/system/users/${userId}/reset-password`)
}

/** 查询用户角色分配所需的企业选项，使用用户管理权限独立鉴权 */
export async function reqGetUserEnterpriseOptions() {
  return http.get<UserEnterpriseOptionDto[]>('/system/users/enterprise-options')
}

/** 单独分配用户角色，使用角色分配权限而非资料编辑权限鉴权 */
export async function reqAssignUserRole(userId: string, payload: AssignUserRoleRequest) {
  const user = await http.patch<UserDto, AssignUserRoleRequest>(
    `/system/users/${userId}/role`,
    payload,
  )
  notifyAccessChanged()
  return user
}
