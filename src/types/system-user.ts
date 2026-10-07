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
  /** 按登录账号独立进行模糊匹配，不区分大小写 */
  username?: string
  /** 按用户姓名独立进行模糊匹配 */
  name?: string
  /** 按角色筛选 */
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
  /** 分配的角色 */
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
  /** 分配的角色 */
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

/** 用户角色分配表单中的企业选项，不包含企业业务详情 */
export interface UserEnterpriseOptionDto {
  /** 可关联的企业唯一标识 */
  id: string
  /** 企业显示名称 */
  name: string
  /** 企业停用时禁止将账号分配给该企业 */
  disabled: boolean
}

/** 单独分配用户角色时提交的数据，不允许修改账号资料 */
export interface AssignUserRoleRequest {
  /** 分配给用户的唯一角色编码 */
  roleCode: RoleCode
  /** 企业用户的所属企业，其他角色不提交 */
  enterpriseId?: string
}
