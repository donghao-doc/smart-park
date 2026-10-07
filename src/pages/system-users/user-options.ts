import type { UserStatus } from '@/types/auth'

/** 用户账号启停状态的显示文案 */
export const userStatusLabels: Record<UserStatus, string> = {
  active: '启用',
  disabled: '停用',
}

/** 用户列表账号状态筛选选项 */
export const userStatusOptions = Object.entries(userStatusLabels).map(([value, label]) => ({
  value,
  label,
}))
