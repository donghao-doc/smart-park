import type { RoleDto, UserDto } from '../types/auth'
import type {
  CreateUserRequest,
  ResetPasswordResult,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserListParams,
  UserPageResult,
} from '../types/system-user'
import http from '../http'

/**
 * 查询固定角色及权限，用于用户表单和权限展示
 */
export async function reqGetRoles() {
  return http.get<RoleDto[]>('/system/roles')
}

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
  return http.put<UserDto, UpdateUserRequest>(`/system/users/${userId}`, payload)
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
