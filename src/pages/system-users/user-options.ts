import type { RoleCode, UserStatus } from '@/types/auth'

/** 系统固定角色在筛选和表单中的显示文案 */
export const userRoleLabels: Record<RoleCode, string> = {
  super_admin: '超级管理员',
  park_operator: '园区运营人员',
  enterprise_user: '企业用户',
}

/** 用户账号启停状态的显示文案 */
export const userStatusLabels: Record<UserStatus, string> = {
  active: '启用',
  disabled: '停用',
}

/** 用户筛选及分配角色时使用的固定选项 */
export const userRoleOptions = Object.entries(userRoleLabels).map(([value, label]) => ({
  value,
  label,
}))

/** 用户列表账号状态筛选选项 */
export const userStatusOptions = Object.entries(userStatusLabels).map(([value, label]) => ({
  value,
  label,
}))
