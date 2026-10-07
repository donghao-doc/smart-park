import http from '@/http'
import type { RoleDto } from '@/types/auth'
import type {
  CreateRoleRequest,
  PermissionNodeDto,
  RoleListParams,
  RolePageResult,
  SystemRoleDto,
  UpdateRolePermissionsRequest,
  UpdateRoleRequest,
} from '@/types/system-role'
import { notifyAccessChanged } from '@/utils/access-events'

/** 查询可分配角色，用于用户筛选、用户表单和权限展示 */
export async function reqGetRoles() {
  return http.get<RoleDto[]>('/system/roles/options')
}

/** 分页查询角色及关联用户数量 */
export async function reqGetRoleList(params: RoleListParams = {}) {
  return http.get<RolePageResult>('/system/roles', { params })
}

/** 查询角色最新详情，编辑及复制前使用 */
export async function reqGetRole(code: string) {
  return http.get<SystemRoleDto>(`/system/roles/${encodeURIComponent(code)}`)
}

/** 查询完整菜单及按钮权限目录 */
export async function reqGetPermissionCatalog() {
  return http.get<PermissionNodeDto[]>('/system/permissions')
}

/** 新建角色，复制角色时同时传入初始权限 */
export async function reqCreateRole(payload: CreateRoleRequest) {
  const role = await http.post<SystemRoleDto, CreateRoleRequest>('/system/roles', payload)
  notifyAccessChanged()
  return role
}

/** 修改角色基本资料，编码和数据范围保持不变 */
export async function reqUpdateRole(code: string, payload: UpdateRoleRequest) {
  const role = await http.put<SystemRoleDto, UpdateRoleRequest>(
    `/system/roles/${encodeURIComponent(code)}`,
    payload,
  )
  notifyAccessChanged()
  return role
}

/** 替换角色权限并通知当前及其他标签页同步生效权限 */
export async function reqUpdateRolePermissions(
  code: string,
  payload: UpdateRolePermissionsRequest,
) {
  const role = await http.put<SystemRoleDto, UpdateRolePermissionsRequest>(
    `/system/roles/${encodeURIComponent(code)}/permissions`,
    payload,
  )
  notifyAccessChanged()
  return role
}

/** 删除未分配用户的自定义角色，内置角色不可删除 */
export async function reqDeleteRole(code: string) {
  await http.delete<null>(`/system/roles/${encodeURIComponent(code)}`)
  notifyAccessChanged()
}
