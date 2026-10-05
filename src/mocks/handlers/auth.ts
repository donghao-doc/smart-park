import { http } from 'msw'
import type { ChangePasswordRequest, LoginRequest, UpdateCurrentUserRequest } from '@/types/auth'
import { filterMenusByPermissions } from '../data/menus'
import { mockRoles } from '../data/users'
import {
  createMockSession,
  getMockState,
  mockSessionDurationSeconds,
  saveMockState,
} from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse, toUserDto } from '../utils'

/**
 * 认证模块 Mock 接口
 */
export const authHandlers = [
  http.get('/api/auth/demo-accounts', async () => {
    const state = getMockState()
    const demoUserIds = new Set(['usr_1001', 'usr_1002', 'usr_1003'])
    const demoAccounts = state.users
      .filter((user) => demoUserIds.has(user.id))
      .map((user) => ({
        username: user.username,
        password: user.password,
        roleCode: user.roleCode,
        roleName: mockRoles[user.roleCode].name,
        description: mockRoles[user.roleCode].description,
      }))
    return createSuccessResponse(demoAccounts)
  }),

  http.post('/api/auth/login', async ({ request }) => {
    let body: Partial<LoginRequest>
    try {
      body = (await request.json()) as Partial<LoginRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const username = body.username?.trim()
    if (!username || !body.password) {
      return createErrorResponse(400, 40002, '请输入账号和密码')
    }

    const state = getMockState()
    const user = state.users.find((item) => item.username.toLowerCase() === username.toLowerCase())

    // 账号不存在与密码错误使用同一提示，避免泄露账号是否存在
    if (!user || user.password !== body.password) {
      return createErrorResponse(401, 40103, '账号或密码错误')
    }

    if (user.status === 'disabled') {
      return createErrorResponse(403, 40301, '账号已停用，请联系超级管理员')
    }

    const session = createMockSession(state, user.id)
    const now = new Date().toISOString()
    user.lastLoginAt = now
    user.updatedAt = now
    saveMockState(state)

    return createSuccessResponse(
      {
        accessToken: session.accessToken,
        expiresIn: mockSessionDurationSeconds,
      },
      '登录成功',
    )
  }),

  http.get('/api/auth/me', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse(toUserDto(auth.state, auth.user))
  }),

  http.get('/api/auth/menus', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    const permissions = mockRoles[auth.user.roleCode].permissions
    return createSuccessResponse(filterMenusByPermissions(permissions))
  }),

  http.put('/api/auth/me', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) return auth.response

    let body: Partial<UpdateCurrentUserRequest> | null
    try {
      body = (await request.json()) as Partial<UpdateCurrentUserRequest> | null
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 30) {
      return createErrorResponse(400, 40011, '姓名不能为空且不能超过 30 个字符')
    }

    // 只写入允许用户自行修改的资料，忽略请求中的角色和账号等字段
    auth.user.name = name
    auth.user.updatedAt = new Date().toISOString()
    saveMockState(auth.state)
    return createSuccessResponse(toUserDto(auth.state, auth.user), '个人资料已保存')
  }),

  http.post('/api/auth/change-password', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) return auth.response

    let body: Partial<ChangePasswordRequest> | null
    try {
      body = (await request.json()) as Partial<ChangePasswordRequest> | null
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    if (typeof body?.currentPassword !== 'string' || !body.currentPassword) {
      return createErrorResponse(400, 40030, '请输入当前密码')
    }
    if (body.currentPassword !== auth.user.password) {
      return createErrorResponse(400, 40031, '当前密码不正确')
    }
    if (
      typeof body.newPassword !== 'string' ||
      body.newPassword.length < 8 ||
      body.newPassword.length > 64 ||
      !body.newPassword.trim()
    ) {
      return createErrorResponse(400, 40032, '新密码长度需为 8～64 位，且不能全部为空格')
    }
    if (body.newPassword === body.currentPassword) {
      return createErrorResponse(400, 40033, '新密码不能与当前密码相同')
    }

    // 修改密码后撤销该账号全部会话，确保旧登录凭据不能继续访问
    auth.user.password = body.newPassword
    auth.user.updatedAt = new Date().toISOString()
    auth.state.sessions = auth.state.sessions.filter((item) => item.userId !== auth.user.id)
    saveMockState(auth.state)
    return createSuccessResponse(null, '密码修改成功，请重新登录')
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    auth.state.sessions = auth.state.sessions.filter(
      (item) => item.accessToken !== auth.accessToken,
    )
    saveMockState(auth.state)
    return createSuccessResponse(null, '退出成功')
  }),
]
