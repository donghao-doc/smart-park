import { http } from 'msw'

import type { DeviceDetailDto, DeviceMutationRequest, DeviceSummaryDto } from '@/types/device'
import {
  deviceCodePattern,
  isDeviceStatus,
  isDeviceType,
  normalizeDeviceCode,
} from '@/utils/device'
import { mockRoles } from '../data/users'
import { saveMockState } from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/** 解析正整数分页参数，拒绝超出安全范围的输入 */
function parsePageNumber(value: string | null, fallback: number) {
  if (value === null) return fallback
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

/** 校验并清理设备档案输入，避免非法字段或空白内容进入持久化状态 */
function validateDevicePayload(value: unknown): DeviceMutationRequest | string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '请求参数格式不正确'
  const body = value as Record<string, unknown>
  const code = typeof body.code === 'string' ? normalizeDeviceCode(body.code) : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const location = typeof body.location === 'string' ? body.location.trim() : ''
  const ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() : ''
  if (!deviceCodePattern.test(code)) return '设备编码需为 3～30 位字母、数字、连字符或下划线'
  if (!name || name.length > 60) return '设备名称不能为空且不能超过 60 个字符'
  if (!isDeviceType(body.type)) return '请选择有效的设备类型'
  if (!location || location.length > 60) return '位置不能为空且不能超过 60 个字符'
  if (!ownerName || ownerName.length > 30) return '责任人不能为空且不能超过 30 个字符'
  if (!isDeviceStatus(body.status)) return '请选择有效的设备状态'
  return {
    code,
    name,
    type: body.type,
    location,
    ownerName,
    status: body.status,
  }
}

/** 新增或更新设备，统一执行编码唯一性、独立状态权限和历史记录维护 */
async function handleDeviceMutation(request: Request, deviceId?: string) {
  const auth = authorizeRequest(request, deviceId ? 'device:update' : 'device:create')
  if ('response' in auth) return auth.response
  const existing = deviceId ? auth.state.devices.find((item) => item.id === deviceId) : undefined
  if (deviceId && !existing) return createErrorResponse(404, 40470, '设备档案不存在')
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(400, 40001, '请求参数格式不正确')
  }
  const payload = validateDevicePayload(body)
  if (typeof payload === 'string') return createErrorResponse(400, 40110, payload)
  if (
    existing &&
    existing.status !== payload.status &&
    !mockRoles[auth.user.roleCode].permissions.includes('device:status')
  ) {
    return createErrorResponse(403, 40302, '当前账号无权修改设备状态')
  }
  if (
    auth.state.devices.some(
      (item) => item.id !== deviceId && normalizeDeviceCode(item.code) === payload.code,
    )
  )
    return createErrorResponse(409, 40970, '设备编码已存在，请使用其他编码')

  const now = new Date().toISOString()
  const statusRecords = existing?.statusRecords ?? []
  if (!existing || existing.status !== payload.status) {
    statusRecords.unshift({
      id: `device_record_${crypto.randomUUID()}`,
      previousStatus: existing?.status ?? null,
      status: payload.status,
      operatorName: auth.user.name,
      changedAt: now,
    })
  }
  const device: DeviceDetailDto = {
    ...payload,
    id: existing?.id ?? `device_${crypto.randomUUID()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    statusRecords: statusRecords.slice(0, 20),
  }
  if (existing) Object.assign(existing, device)
  else auth.state.devices.unshift(device)
  saveMockState(auth.state)
  return createSuccessResponse(
    device,
    existing ? '设备档案已更新' : '设备登记成功',
    existing ? 200 : 201,
  )
}

/** 设备管理模拟接口，所有读写操作均校验登录和业务权限 */
export const deviceHandlers = [
  http.get('/api/devices/summary', async ({ request }) => {
    const auth = authorizeRequest(request, 'device:view')
    if ('response' in auth) return auth.response
    const summary: DeviceSummaryDto = {
      total: auth.state.devices.length,
      counts: { normal: 0, fault: 0, offline: 0, disabled: 0 },
    }
    for (const device of auth.state.devices) summary.counts[device.status] += 1
    return createSuccessResponse(summary)
  }),
  http.get('/api/devices/locations', async ({ request }) => {
    const auth = authorizeRequest(request, 'device:view')
    if ('response' in auth) return auth.response
    return createSuccessResponse([...new Set(auth.state.devices.map((item) => item.location))])
  }),
  http.get('/api/devices', async ({ request }) => {
    const auth = authorizeRequest(request, 'device:view')
    if ('response' in auth) return auth.response
    const query = new URL(request.url).searchParams
    const page = parsePageNumber(query.get('page'), 1)
    const pageSize = parsePageNumber(query.get('pageSize'), 20)
    const keyword = query.get('keyword')?.trim().toLowerCase()
    const type = query.get('type')
    const status = query.get('status')
    const location = query.get('location')?.trim()
    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40111, '分页参数不正确，每页最多查询 100 条')
    }
    if ((type && !isDeviceType(type)) || (status && !isDeviceStatus(status))) {
      return createErrorResponse(400, 40112, '设备类型或状态筛选条件不正确')
    }
    const devices = auth.state.devices
      .filter(
        (item) =>
          (!keyword ||
            item.name.toLowerCase().includes(keyword) ||
            item.code.toLowerCase().includes(keyword)) &&
          (!type || item.type === type) &&
          (!status || item.status === status) &&
          (!location || item.location === location),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: devices
        .slice(start, start + pageSize)
        .map(({ statusRecords: _records, ...device }) => device),
      total: devices.length,
      page,
      pageSize,
    })
  }),
  http.get('/api/devices/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'device:view')
    if ('response' in auth) return auth.response
    const device = auth.state.devices.find((item) => item.id === params.id)
    return device
      ? createSuccessResponse(device)
      : createErrorResponse(404, 40470, '设备档案不存在')
  }),
  http.post('/api/devices', ({ request }) => handleDeviceMutation(request)),
  http.put('/api/devices/:id', ({ request, params }) =>
    handleDeviceMutation(request, String(params.id)),
  ),
]
