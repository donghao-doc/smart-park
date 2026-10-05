/**
 * 系统内置角色编码
 */
export type RoleCode = 'super_admin' | 'park_operator' | 'enterprise_user'

/**
 * 角色可访问的数据范围
 */
export type DataScope = 'all' | 'park' | 'enterprise'

/**
 * 用户账号状态
 */
export type UserStatus = 'active' | 'disabled'

/**
 * 系统权限点编码
 */
export type PermissionCode =
  | 'dashboard:view'
  | 'park:view'
  | 'park:update'
  | 'enterprise:view'
  | 'enterprise:create'
  | 'enterprise:update'
  | 'enterprise:status'
  | 'personnel:view'
  | 'personnel:create'
  | 'personnel:update'
  | 'personnel:status'
  | 'visitor:view'
  | 'visitor:create'
  | 'visitor:approve'
  | 'visitor:check-in'
  | 'visitor:check-out'
  | 'visitor:cancel'
  | 'vehicle:view'
  | 'vehicle:create'
  | 'vehicle:update'
  | 'vehicle:status'
  | 'parking-record:view'
  | 'work-order:view'
  | 'work-order:create'
  | 'work-order:process'
  | 'work-order:confirm'
  | 'work-order:cancel'
  | 'work-order:reopen'
  | 'device:view'
  | 'device:create'
  | 'device:update'
  | 'device:status'
  | 'system-user:view'
  | 'system-user:create'
  | 'system-user:update'
  | 'system-user:status'
  | 'system-user:reset-password'
  | 'operation-log:view'
  | 'mock-data:manage'

/**
 * 固定角色及其权限配置
 */
export interface RoleDto {
  /** 角色编码，用于接口鉴权 */
  code: RoleCode
  /** 角色显示名称 */
  name: string
  /** 角色适用场景说明 */
  description: string
  /** 角色可访问的数据范围 */
  dataScope: DataScope
  /** 角色拥有的权限点集合 */
  permissions: PermissionCode[]
}

/**
 * 用户关联企业的摘要信息
 */
export interface UserEnterpriseDto {
  /** 企业稳定唯一标识 */
  id: string
  /** 企业名称快照 */
  name: string
}

/**
 * 对外返回的用户信息，不包含密码等认证凭据
 */
export interface UserDto {
  /** 用户稳定唯一标识 */
  id: string
  /** 登录账号，全局唯一 */
  username: string
  /** 用户姓名 */
  name: string
  /** 当前固定角色 */
  role: RoleDto
  /** 企业用户所属企业，非企业角色为 null */
  enterprise: UserEnterpriseDto | null
  /** 账号启停状态 */
  status: UserStatus
  /** 最近一次成功登录时间，ISO 8601 格式 */
  lastLoginAt: string | null
  /** 账号创建时间，ISO 8601 格式 */
  createdAt: string
  /** 账号最后更新时间，ISO 8601 格式 */
  updatedAt: string
}

/**
 * 登录接口提交参数
 */
export interface LoginRequest {
  /** 登录账号 */
  username: string
  /** 登录密码 */
  password: string
}

/**
 * 登录成功后返回的会话信息
 */
export interface LoginResult {
  /** 后续请求使用的 Bearer Token */
  accessToken: string
  /** Token 有效期秒数 */
  expiresIn: number
}

/** 当前登录用户可以自行修改的基础资料 */
export interface UpdateCurrentUserRequest {
  /** 用户显示姓名，去除首尾空格后为 1～30 个字符 */
  name: string
}

/** 当前登录用户修改密码的提交参数，不包含确认密码 */
export interface ChangePasswordRequest {
  /** 当前账号的原密码，用于验证修改操作 */
  currentPassword: string
  /** 与原密码不同的新密码，长度为 8～64 位 */
  newPassword: string
}

/**
 * 登录页展示的演示账号
 */
export interface DemoAccountDto {
  /** 登录账号 */
  username: string
  /** 演示密码 */
  password: string
  /** 账号对应的角色编码 */
  roleCode: RoleCode
  /** 账号对应的角色名称 */
  roleName: string
  /** 演示账号用途说明 */
  description: string
}
