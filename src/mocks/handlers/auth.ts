import { delay, http } from 'msw'
import type { LoginRequest } from '../../types/auth'
import { filterMenusByPermissions } from '../data/menus'
import { mockRoles } from '../data/users'
import { createMockSession, getMockState, mockSessionDurationSeconds, saveMockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  mockResponseDelay,
  toUserDto,
} from '../utils'

/**
 * 认证模块 Mock 接口
 */
export const authHandlers = [
  http.get('/api/auth/demo-accounts', async () => {
    await delay(mockResponseDelay)
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
    await delay(mockResponseDelay)

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
        user: toUserDto(state, user),
      },
      '登录成功',
    )
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse(toUserDto(auth.state, auth.user))
  }),

  http.get('/api/auth/menus', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    const permissions = mockRoles[auth.user.roleCode].permissions
    return createSuccessResponse(filterMenusByPermissions(permissions))
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request)
    if ('response' in auth) {
      return auth.response
    }

    auth.state.sessions = auth.state.sessions.filter((item) => item.accessToken !== auth.accessToken)
    saveMockState(auth.state)
    return createSuccessResponse(null, '退出成功')
  }),
]
