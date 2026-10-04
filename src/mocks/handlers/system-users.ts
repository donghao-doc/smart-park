import { delay, http } from 'msw'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
} from '@/types/system-user'
import { mockRoles } from '../data/users'
import { saveMockState, type MockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  isRoleCode,
  isUserStatus,
  mockResponseDelay,
  toUserDto,
} from '../utils'

const usernamePattern = /^[a-zA-Z][a-zA-Z0-9._-]{3,31}$/

/**
 * 校验用户名、姓名、角色和企业归属等公共用户字段
 */
function validateUserFields(
  state: MockState,
  body: Partial<CreateUserRequest | UpdateUserRequest>,
  excludedUserId?: string,
) {
  const username = body.username?.trim() ?? ''
  const name = body.name?.trim()

  if (!usernamePattern.test(username)) {
    return createErrorResponse(400, 40010, '用户名需以字母开头，长度为 4～32 位')
  }

  if (!name || name.length > 30) {
    return createErrorResponse(400, 40011, '姓名不能为空且不能超过 30 个字符')
  }

  if (!isRoleCode(body.roleCode)) {
    return createErrorResponse(400, 40012, '请选择有效的固定角色')
  }

  const duplicate = state.users.some(
    (item) => item.id !== excludedUserId && item.username.toLowerCase() === username.toLowerCase(),
  )
  if (duplicate) {
    return createErrorResponse(400, 40013, '用户名已存在')
  }

  if (body.roleCode === 'enterprise_user') {
    const enterprise = state.enterprises.find((item) => item.id === body.enterpriseId)
    if (!enterprise) {
      return createErrorResponse(400, 40014, '企业用户必须选择所属企业')
    }

    if (enterprise.status === 'disabled') {
      return createErrorResponse(400, 40015, '所属企业已停用，无法分配企业用户')
    }
  }

  return null
}

/**
 * 将查询参数转换为有效正整数
 */
function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback
  }

  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null
}

/**
 * 用户管理模块 Mock 接口，仅超级管理员角色具备对应权限
 */
export const systemUserHandlers = [
  http.get('/api/system/roles', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:view')
    if ('response' in auth) {
      return auth.response
    }

    const roles = Object.values(mockRoles).map((role) => ({
      ...role,
      permissions: [...role.permissions],
    }))
    return createSuccessResponse(roles)
  }),

  http.get('/api/system/users', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:view')
    if ('response' in auth) {
      return auth.response
    }

    const url = new URL(request.url)
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 20)
    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40016, '分页参数不正确，每页最多查询 100 条')
    }

    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase()
    const username = url.searchParams.get('username')?.trim().toLowerCase()
    const name = url.searchParams.get('name')?.trim().toLowerCase()
    const roleCode = url.searchParams.get('roleCode')
    const status = url.searchParams.get('status')
    const enterpriseId = url.searchParams.get('enterpriseId')

    if (roleCode && !isRoleCode(roleCode)) {
      return createErrorResponse(400, 40012, '角色筛选条件不正确')
    }

    if (status && !isUserStatus(status)) {
      return createErrorResponse(400, 40017, '状态筛选条件不正确')
    }

    const filteredUsers = auth.state.users
      .filter((user) => {
        const matchesKeyword =
          !keyword ||
          user.username.toLowerCase().includes(keyword) ||
          user.name.toLowerCase().includes(keyword)
        const matchesRole = !roleCode || user.roleCode === roleCode
        const matchesStatus = !status || user.status === status
        const matchesEnterprise = !enterpriseId || user.enterpriseId === enterpriseId
        const matchesUsername = !username || user.username.toLowerCase().includes(username)
        const matchesName = !name || user.name.toLowerCase().includes(name)
        return (
          matchesKeyword &&
          matchesUsername &&
          matchesName &&
          matchesRole &&
          matchesStatus &&
          matchesEnterprise
        )
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))

    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: filteredUsers.slice(start, start + pageSize).map((user) => toUserDto(auth.state, user)),
      total: filteredUsers.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/system/users/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:view')
    if ('response' in auth) {
      return auth.response
    }

    const user = auth.state.users.find((item) => item.id === params.id)
    if (!user) {
      return createErrorResponse(404, 40401, '用户不存在')
    }

    return createSuccessResponse(toUserDto(auth.state, user))
  }),

  http.post('/api/system/users', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:create')
    if ('response' in auth) {
      return auth.response
    }

    let body: Partial<CreateUserRequest>
    try {
      body = (await request.json()) as Partial<CreateUserRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationError = validateUserFields(auth.state, body)
    if (validationError) {
      return validationError
    }

    if (!body.password || body.password.length < 8) {
      return createErrorResponse(400, 40018, '初始密码至少需要 8 位')
    }

    const now = new Date().toISOString()
    const user = {
      id: `usr_${crypto.randomUUID()}`,
      username: body.username!.trim(),
      name: body.name!.trim(),
      password: body.password,
      roleCode: body.roleCode!,
      enterpriseId: body.roleCode === 'enterprise_user' ? body.enterpriseId! : null,
      status: 'active' as const,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    }

    auth.state.users.push(user)
    saveMockState(auth.state)
    return createSuccessResponse(toUserDto(auth.state, user), '用户创建成功', 201)
  }),

  http.put('/api/system/users/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:update')
    if ('response' in auth) {
      return auth.response
    }

    const user = auth.state.users.find((item) => item.id === params.id)
    if (!user) {
      return createErrorResponse(404, 40401, '用户不存在')
    }

    let body: Partial<UpdateUserRequest>
    try {
      body = (await request.json()) as Partial<UpdateUserRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationError = validateUserFields(auth.state, body, user.id)
    if (validationError) {
      return validationError
    }

    if (user.roleCode === 'super_admin' && body.roleCode !== 'super_admin') {
      return createErrorResponse(400, 40019, '超级管理员账号不能变更为其他角色')
    }

    user.username = body.username!.trim()
    user.name = body.name!.trim()
    user.roleCode = body.roleCode!
    user.enterpriseId = body.roleCode === 'enterprise_user' ? body.enterpriseId! : null
    user.updatedAt = new Date().toISOString()
    saveMockState(auth.state)
    return createSuccessResponse(toUserDto(auth.state, user), '用户信息更新成功')
  }),

  http.patch('/api/system/users/:id/status', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:status')
    if ('response' in auth) {
      return auth.response
    }

    const user = auth.state.users.find((item) => item.id === params.id)
    if (!user) {
      return createErrorResponse(404, 40401, '用户不存在')
    }

    let body: Partial<UpdateUserStatusRequest>
    try {
      body = (await request.json()) as Partial<UpdateUserStatusRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    if (!isUserStatus(body.status)) {
      return createErrorResponse(400, 40020, '目标账号状态不正确')
    }

    if (user.roleCode === 'super_admin' && body.status === 'disabled') {
      return createErrorResponse(400, 40021, '超级管理员账号不能停用')
    }

    user.status = body.status
    user.updatedAt = new Date().toISOString()
    if (body.status === 'disabled') {
      auth.state.sessions = auth.state.sessions.filter((item) => item.userId !== user.id)
    }
    saveMockState(auth.state)
    return createSuccessResponse(toUserDto(auth.state, user), body.status === 'active' ? '用户已启用' : '用户已停用')
  }),

  http.post('/api/system/users/:id/reset-password', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'system-user:reset-password')
    if ('response' in auth) {
      return auth.response
    }

    const user = auth.state.users.find((item) => item.id === params.id)
    if (!user) {
      return createErrorResponse(404, 40401, '用户不存在')
    }

    const temporaryPassword = `Temp@${crypto.randomUUID().slice(0, 8)}`
    user.password = temporaryPassword
    user.updatedAt = new Date().toISOString()
    auth.state.sessions = auth.state.sessions.filter((item) => item.userId !== user.id)
    saveMockState(auth.state)

    return createSuccessResponse(
      {
        temporaryPassword,
        message: '密码已重置，请使用临时密码登录',
      },
      '密码重置成功',
    )
  }),
]
