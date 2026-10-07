import { HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api'
import type { PermissionCode, RoleCode, UserDto, UserStatus } from '@/types/auth'
import type { MockUserEntity } from './data/users'
import { getMockState, saveMockState, type MockState } from './store'

/**
 * 创建符合项目规范的成功响应
 */
export function createSuccessResponse<T>(data: T, message = '请求成功', status = 200) {
  return HttpResponse.json<ApiResponse<T>>(
    {
      code: 0,
      message,
      data,
    },
    { status },
  )
}

/**
 * 创建可直接展示错误信息的失败响应
 */
export function createErrorResponse(status: number, code: number, message: string) {
  return HttpResponse.json(
    {
      code,
      message,
      data: null,
    },
    { status },
  )
}

/**
 * 将内部用户实体转换为不包含密码的对外 DTO
 */
export function toUserDto(state: MockState, user: MockUserEntity): UserDto {
  const role = state.roles.find((item) => item.code === user.roleCode)!
  const enterprise = user.enterpriseId
    ? state.enterprises.find((item) => item.id === user.enterpriseId)
    : undefined

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: {
      ...role,
      permissions: [...role.permissions],
    },
    enterprise: enterprise ? { id: enterprise.id, name: enterprise.name } : null,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

interface AuthorizedRequest {
  state: MockState
  user: MockUserEntity
  accessToken: string
}

interface RejectedRequest {
  response: ReturnType<typeof createErrorResponse>
}

/**
 * 校验 Bearer Token、账号状态和接口权限
 */
export function authorizeRequest(
  request: Request,
  permission?: PermissionCode,
): AuthorizedRequest | RejectedRequest {
  const authorization = request.headers.get('Authorization')
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : ''

  if (!accessToken) {
    return {
      response: createErrorResponse(401, 40101, '登录状态已失效，请重新登录'),
    }
  }

  const state = getMockState()
  const sessionIndex = state.sessions.findIndex((item) => item.accessToken === accessToken)
  const session = state.sessions[sessionIndex]

  if (!session) {
    return {
      response: createErrorResponse(401, 40101, '登录状态已失效，请重新登录'),
    }
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    state.sessions.splice(sessionIndex, 1)
    saveMockState(state)
    return {
      response: createErrorResponse(401, 40102, '登录已过期，请重新登录'),
    }
  }

  const user = state.users.find((item) => item.id === session.userId)
  if (!user) {
    state.sessions.splice(sessionIndex, 1)
    saveMockState(state)
    return {
      response: createErrorResponse(401, 40101, '登录状态已失效，请重新登录'),
    }
  }

  if (user.status === 'disabled') {
    state.sessions.splice(sessionIndex, 1)
    saveMockState(state)
    return {
      response: createErrorResponse(403, 40301, '账号已停用，请联系超级管理员'),
    }
  }

  const role = state.roles.find((item) => item.code === user.roleCode)
  if (!role || (permission && !role.permissions.includes(permission))) {
    return {
      response: createErrorResponse(403, 40302, '当前账号无权执行此操作'),
    }
  }

  return { state, user, accessToken }
}

/**
 * 判断输入是否为已存在的角色编码
 */
export function isRoleCode(state: MockState, value: unknown): value is RoleCode {
  return typeof value === 'string' && state.roles.some((role) => role.code === value)
}

/**
 * 判断输入是否为有效账号状态
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return value === 'active' || value === 'disabled'
}

/** 返回账号当前生效的角色权限，角色被移除时默认拒绝 */
export function getUserPermissions(state: MockState, user: MockUserEntity): PermissionCode[] {
  return state.roles.find((role) => role.code === user.roleCode)?.permissions ?? []
}

/** 记录角色维护和用户授权，调用方负责与业务数据一同保存 */
export function recordAuthorizationLog(
  state: MockState,
  operator: MockUserEntity,
  request: Request,
  action: string,
  objectId: string,
  objectName: string,
  requestParams: Record<string, unknown> | null,
) {
  state.authorizationLogs.push({
    id: `log_${crypto.randomUUID()}`,
    operatedAt: new Date().toISOString(),
    operatorName: operator.name,
    roleName: state.roles.find((role) => role.code === operator.roleCode)?.name ?? '未知角色',
    module: 'system',
    action,
    objectName,
    objectId,
    ipAddress: '127.0.0.1',
    result: 'success',
    requestMethod: request.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    requestUrl: new URL(request.url).pathname,
    description: `${action}：${objectName}`,
    requestParams,
    failureReason: null,
  })
}
