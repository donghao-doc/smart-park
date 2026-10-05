import type {
  ChangePasswordRequest,
  DemoAccountDto,
  LoginRequest,
  LoginResult,
  UpdateCurrentUserRequest,
  UserDto,
} from '@/types/auth'
import type { MenuItemDto } from '@/types/menu'
import http from '@/http'

/**
 * 获取登录页展示的三套演示账号
 */
export async function reqGetDemoAccounts() {
  return http.get<DemoAccountDto[]>('/auth/demo-accounts')
}

/**
 * 使用账号密码创建登录会话
 */
export async function reqLogin(payload: LoginRequest) {
  return http.post<LoginResult, LoginRequest>('/auth/login', payload)
}

/**
 * 获取当前登录用户、角色和权限信息
 */
export async function reqGetCurrentUser() {
  return http.get<UserDto>('/auth/me')
}

/** 更新当前登录用户的基础资料，不允许变更账号、角色或企业归属 */
export async function reqUpdateCurrentUser(payload: UpdateCurrentUserRequest) {
  return http.put<UserDto, UpdateCurrentUserRequest>('/auth/me', payload)
}

/** 验证原密码并修改当前用户密码，成功后所有登录会话失效 */
export async function reqChangePassword(payload: ChangePasswordRequest) {
  return http.post<null, ChangePasswordRequest>('/auth/change-password', payload)
}

/**
 * 获取当前登录用户可访问的后端动态菜单树
 */
export async function reqGetCurrentUserMenus() {
  return http.get<MenuItemDto[]>('/auth/menus')
}

/**
 * 注销当前服务端会话
 */
export async function reqLogout() {
  return http.post<null>('/auth/logout')
}
