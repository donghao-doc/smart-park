import { http } from 'msw'

import type { RoleDto } from '@/types/auth'
import type { CreateRoleRequest, UpdateRoleRequest } from '@/types/system-role'
import { hasValidPermissionDependencies } from '@/utils/permissions'
import { permissionCatalog, permissionCodes } from '../data/permissions'
import { saveMockState, type MockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  getUserPermissions,
  recordAuthorizationLog,
} from '../utils'

/** 角色管理返回用户数量，始终从最新用户分配关系计算 */
function toRoleDto(state: MockState, role: RoleDto) {
  return {
    ...role,
    userCount: state.users.filter((user) => user.roleCode === role.code).length,
  }
}

/** 校验角色名称及说明，不允许空白名称或重复名称 */
function validateRoleFields(state: MockState, body: Partial<UpdateRoleRequest>, code?: string) {
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 30) {
    return createErrorResponse(400, 400140, '角色名称不能为空且不能超过 30 个字符')
  }
  if (typeof body.description !== 'string' || body.description.trim().length > 200) {
    return createErrorResponse(400, 400141, '角色说明不能超过 200 个字符')
  }
  if (state.roles.some((role) => role.code !== code && role.name === body.name!.trim())) {
    return createErrorResponse(400, 400142, '角色名称已存在')
  }
  return null
}

/** 校验权限白名单、页面依赖和授权边界，禁止授予操作者自身不具备的权限 */
function validatePermissions(permissions: unknown, available: RoleDto['permissions']) {
  if (
    !Array.isArray(permissions) ||
    permissions.some((permission) => !permissionCodes.includes(permission))
  ) {
    return createErrorResponse(400, 400143, '权限配置包含无效权限点')
  }
  if (!hasValidPermissionDependencies(permissionCatalog, permissions)) {
    return createErrorResponse(400, 400144, '配置操作权限时必须同时授予对应页面访问权限')
  }
  if (permissions.some((permission) => !available.includes(permission))) {
    return createErrorResponse(403, 403140, '不能授予超出自身权限范围的权限')
  }
  return null
}

/** 动态角色管理接口，角色授权与普通角色资料编辑分别鉴权 */
export const systemRoleHandlers = [
  http.get('/api/system/roles/options', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) return auth.response
    const permissions = getUserPermissions(auth.state, auth.user)
    if (!permissions.includes('system-user:view') && !permissions.includes('system-role:view')) {
      return createErrorResponse(403, 40302, '当前账号无权查询角色')
    }
    return createSuccessResponse(auth.state.roles)
  }),
  http.get('/api/system/permissions', async ({ request }) => {
    const auth = authorizeRequest(request)
    if ('response' in auth) return auth.response
    const permissions = getUserPermissions(auth.state, auth.user)
    if (!permissions.includes('system-user:view') && !permissions.includes('system-role:view')) {
      return createErrorResponse(403, 40302, '当前账号无权查看权限目录')
    }
    return createSuccessResponse(permissionCatalog)
  }),
  http.get('/api/system/roles', async ({ request }) => {
    const auth = authorizeRequest(request, 'system-role:view')
    if ('response' in auth) return auth.response
    const params = new URL(request.url).searchParams
    const page = Number(params.get('page') ?? 1)
    const pageSize = Number(params.get('pageSize') ?? 20)
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      return createErrorResponse(400, 400145, '分页参数不正确，每页最多查询 100 条')
    }
    const keyword = params.get('keyword')?.trim().toLowerCase()
    const roles = auth.state.roles.filter(
      (role) => !keyword || `${role.name} ${role.code}`.toLowerCase().includes(keyword),
    )
    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: roles.slice(start, start + pageSize).map((role) => toRoleDto(auth.state, role)),
      total: roles.length,
      page,
      pageSize,
    })
  }),
  http.get('/api/system/roles/:code', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'system-role:view')
    if ('response' in auth) return auth.response
    const role = auth.state.roles.find((item) => item.code === params.code)
    if (!role) return createErrorResponse(404, 404140, '角色不存在')
    return createSuccessResponse(toRoleDto(auth.state, role))
  }),
  http.post('/api/system/roles', async ({ request }) => {
    const auth = authorizeRequest(request, 'system-role:create')
    if ('response' in auth) return auth.response
    let body: Partial<CreateRoleRequest> | null
    try {
      body = (await request.json()) as typeof body
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    if (!body || typeof body !== 'object') {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    const error = validateRoleFields(auth.state, body)
    if (error) return error
    if (typeof body.code !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_-]{3,31}$/.test(body.code)) {
      return createErrorResponse(400, 400146, '角色编码需以字母开头，长度为 4～32 位')
    }
    if (auth.state.roles.some((role) => role.code.toLowerCase() === body.code!.toLowerCase())) {
      return createErrorResponse(400, 400147, '角色编码已存在')
    }
    const permissions = getUserPermissions(auth.state, auth.user)
    const permissionError = validatePermissions(body.permissions, permissions)
    if (permissionError) return permissionError
    if (body.permissions!.length && !permissions.includes('system-role:grant')) {
      return createErrorResponse(403, 40302, '复制权限需要配置角色权限的权限')
    }
    const role: RoleDto = {
      code: body.code,
      name: body.name!.trim(),
      description: body.description!.trim(),
      builtIn: false,
      dataScope: 'park',
      permissions: [...new Set(body.permissions!)],
    }
    auth.state.roles.unshift(role)
    recordAuthorizationLog(auth.state, auth.user, request, '新增角色', role.code, role.name, {
      code: role.code,
      permissions: role.permissions,
    })
    saveMockState(auth.state)
    return createSuccessResponse(toRoleDto(auth.state, role), '角色创建成功', 201)
  }),
  http.put('/api/system/roles/:code', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'system-role:update')
    if ('response' in auth) return auth.response
    const role = auth.state.roles.find((item) => item.code === params.code)
    if (!role) return createErrorResponse(404, 404140, '角色不存在')
    if (role.code === 'super_admin') {
      return createErrorResponse(403, 403141, '超级管理员角色不可修改')
    }
    let body: Partial<UpdateRoleRequest> | null
    try {
      body = (await request.json()) as typeof body
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    if (!body || typeof body !== 'object') {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    const error = validateRoleFields(auth.state, body, role.code)
    if (error) return error
    role.name = body.name!.trim()
    role.description = body.description!.trim()
    recordAuthorizationLog(auth.state, auth.user, request, '编辑角色', role.code, role.name, {
      name: role.name,
      description: role.description,
    })
    saveMockState(auth.state)
    return createSuccessResponse(toRoleDto(auth.state, role), '角色已更新')
  }),
  http.put('/api/system/roles/:code/permissions', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'system-role:grant')
    if ('response' in auth) return auth.response
    const role = auth.state.roles.find((item) => item.code === params.code)
    if (!role) return createErrorResponse(404, 404140, '角色不存在')
    if (role.code === 'super_admin') {
      return createErrorResponse(403, 403141, '超级管理员权限不可修改')
    }
    let body: { permissions?: unknown } | null
    try {
      body = (await request.json()) as typeof body
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    const error = validatePermissions(body?.permissions, getUserPermissions(auth.state, auth.user))
    if (error) return error
    const previousPermissions = [...role.permissions]
    role.permissions = [...new Set(body!.permissions as RoleDto['permissions'])]
    recordAuthorizationLog(auth.state, auth.user, request, '配置角色权限', role.code, role.name, {
      previousPermissions,
      permissions: role.permissions,
    })
    saveMockState(auth.state)
    return createSuccessResponse(toRoleDto(auth.state, role), '角色权限已保存')
  }),
  http.delete('/api/system/roles/:code', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'system-role:delete')
    if ('response' in auth) return auth.response
    const role = auth.state.roles.find((item) => item.code === params.code)
    if (!role) return createErrorResponse(404, 404140, '角色不存在')
    if (role.builtIn) return createErrorResponse(400, 400148, '内置角色不可删除')
    if (auth.state.users.some((user) => user.roleCode === role.code)) {
      return createErrorResponse(400, 400149, '角色仍有关联用户，请先调整用户角色')
    }
    auth.state.roles = auth.state.roles.filter((item) => item.code !== role.code)
    recordAuthorizationLog(auth.state, auth.user, request, '删除角色', role.code, role.name, null)
    saveMockState(auth.state)
    return createSuccessResponse(null, '角色已删除')
  }),
]
