import type { PageResult } from './api'
import type { RoleCode, UserDto, UserStatus } from './auth'

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  /** 当前页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 匹配用户名或姓名的关键词 */
  keyword?: string
  /** 按固定角色筛选 */
  roleCode?: RoleCode
  /** 按账号状态筛选 */
  status?: UserStatus
  /** 按所属企业筛选 */
  enterpriseId?: string
}

/**
 * 用户分页列表响应数据
 */
export type UserPageResult = PageResult<UserDto>

/**
 * 创建用户时提交的数据
 */
export interface CreateUserRequest {
  /** 登录账号，支持字母、数字、点、下划线和连字符 */
  username: string
  /** 用户姓名 */
  name: string
  /** 初始登录密码，至少 8 位 */
  password: string
  /** 分配的固定角色 */
  roleCode: RoleCode
  /** 企业用户所属企业标识，企业用户必填 */
  enterpriseId?: string
}

/**
 * 编辑用户时提交的数据
 */
export interface UpdateUserRequest {
  /** 登录账号，修改后仍需保持全局唯一 */
  username: string
  /** 用户姓名 */
  name: string
  /** 分配的固定角色 */
  roleCode: RoleCode
  /** 企业用户所属企业标识，企业用户必填 */
  enterpriseId?: string
}

/**
 * 更新用户状态时提交的数据
 */
export interface UpdateUserStatusRequest {
  /** 目标账号状态 */
  status: UserStatus
}

/**
 * 重置模拟密码后的返回数据
 */
export interface ResetPasswordResult {
  /** 仅在本次响应中返回的临时密码 */
  temporaryPassword: string
  /** 提示用户及时修改密码的说明 */
  message: string
}
