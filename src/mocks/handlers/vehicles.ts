import { delay, http } from 'msw'

import type { VehicleMutationRequest, VehicleStatus, VehicleType } from '@/types/vehicle'
import { normalizeVehiclePlate, vehiclePlatePattern } from '@/utils/vehicle'
import { mockRoles } from '../data/users'
import { saveMockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  mockResponseDelay,
} from '../utils'

/** 判断车辆启停状态是否合法 */
function isVehicleStatus(value: unknown): value is VehicleStatus {
  return value === 'active' || value === 'disabled'
}

/** 判断车辆业务类型是否合法 */
function isVehicleType(value: unknown): value is VehicleType {
  return value === 'employee' || value === 'visitor'
}

/** 解析正整数分页参数，拒绝无效值和超出安全范围的数值 */
function parsePageNumber(value: string | null, fallback: number) {
  if (value === null) return fallback
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

/** 校验并规范化车辆档案，非法 JSON 字段类型也返回业务错误 */
function validateVehiclePayload(value: unknown): VehicleMutationRequest | string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '请求参数格式不正确'
  }
  const body = value as Record<string, unknown>
  const plateNumber = typeof body.plateNumber === 'string'
    ? normalizeVehiclePlate(body.plateNumber)
    : ''
  const ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

  if (!vehiclePlatePattern.test(plateNumber)) return '请输入有效的普通或新能源车牌号'
  if (!isVehicleType(body.type)) return '请选择有效的车辆类型'
  if (!ownerName || ownerName.length > 30) return '车主姓名不能为空且不能超过 30 个字符'
  if (!/^1\d{10}$/.test(phone)) return '请输入有效的 11 位手机号码'
  if (typeof body.enterpriseId !== 'string' || !body.enterpriseId.trim()) {
    return '请选择所属企业'
  }
  if (!isVehicleStatus(body.status)) return '请选择有效的车辆状态'

  return {
    plateNumber,
    type: body.type,
    ownerName,
    enterpriseId: body.enterpriseId.trim(),
    phone,
    status: body.status,
  }
}

/** 登记或更新车辆，统一车牌唯一性、企业范围及独立启停权限校验 */
async function handleVehicleMutation(request: Request, vehicleId?: string) {
  await delay(mockResponseDelay)
  const auth = authorizeRequest(request, vehicleId ? 'vehicle:update' : 'vehicle:create')
  if ('response' in auth) return auth.response

  const existing = vehicleId
    ? auth.state.vehicles.find((item) => item.id === vehicleId)
    : undefined
  if (vehicleId && !existing) return createErrorResponse(404, 40450, '车辆档案不存在')
  if (
    existing && auth.user.roleCode === 'enterprise_user' &&
    existing.enterpriseId !== auth.user.enterpriseId
  ) {
    return createErrorResponse(403, 40307, '无权修改其他企业车辆档案')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(400, 40001, '请求参数格式不正确')
  }
  const payload = validateVehiclePayload(body)
  if (typeof payload === 'string') return createErrorResponse(400, 40090, payload)

  const enterprise = auth.state.enterprises.find((item) => item.id === payload.enterpriseId)
  if (!enterprise) return createErrorResponse(400, 40091, '所属企业不存在')
  if (
    auth.user.roleCode === 'enterprise_user' && enterprise.id !== auth.user.enterpriseId
  ) {
    return createErrorResponse(403, 40307, '无权登记其他企业车辆档案')
  }
  if (
    existing && existing.status !== payload.status &&
    !mockRoles[auth.user.roleCode].permissions.includes('vehicle:status')
  ) {
    return createErrorResponse(403, 40302, '当前账号无权启停车辆')
  }

  // 停用后仍保留原档案，重复登记时提示编辑或启用原档案
  if (auth.state.vehicles.some(
    (item) => item.id !== vehicleId &&
      normalizeVehiclePlate(item.plateNumber) === payload.plateNumber,
  )) {
    return createErrorResponse(409, 40950, '车牌号已存在，请编辑或启用原车辆档案')
  }

  const now = new Date().toISOString()
  const vehicle = {
    ...payload,
    id: existing?.id ?? `veh_${crypto.randomUUID()}`,
    enterpriseName: enterprise.name,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  if (existing) {
    Object.assign(existing, vehicle)
  } else {
    auth.state.vehicles.unshift(vehicle)
  }
  saveMockState(auth.state)
  return createSuccessResponse(
    vehicle,
    existing ? '车辆档案已更新' : '车辆登记成功',
    existing ? 200 : 201,
  )
}

/** 车辆档案模拟接口，统一执行权限和企业数据范围校验 */
export const vehicleHandlers = [
  http.get('/api/vehicles/enterprise-options', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'vehicle:view')
    if ('response' in auth) return auth.response
    const enterprises = auth.state.enterprises.filter(
      (item) => auth.user.roleCode !== 'enterprise_user' ||
        item.id === auth.user.enterpriseId,
    )
    return createSuccessResponse(enterprises.map((item) => ({ id: item.id, name: item.name })))
  }),

  http.get('/api/vehicles', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'vehicle:view')
    if ('response' in auth) return auth.response

    const query = new URL(request.url).searchParams
    const page = parsePageNumber(query.get('page'), 1)
    const pageSize = parsePageNumber(query.get('pageSize'), 20)
    const plateNumber = normalizeVehiclePlate(query.get('plateNumber') ?? '')
    const type = query.get('type')
    const status = query.get('status')
    const enterpriseId = query.get('enterpriseId')?.trim()
    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40092, '分页参数不正确，每页最多查询 100 条')
    }
    if ((type && !isVehicleType(type)) || (status && !isVehicleStatus(status))) {
      return createErrorResponse(400, 40093, '车辆类型或状态筛选条件不正确')
    }

    const vehicles = auth.state.vehicles.filter((item) => (
      (auth.user.roleCode !== 'enterprise_user' || item.enterpriseId === auth.user.enterpriseId) &&
      (!plateNumber || normalizeVehiclePlate(item.plateNumber).includes(plateNumber)) &&
      (!type || item.type === type) &&
      (!status || item.status === status) &&
      (!enterpriseId || item.enterpriseId === enterpriseId)
    )).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    const start = (page - 1) * pageSize

    return createSuccessResponse({
      list: vehicles.slice(start, start + pageSize).map((item) => ({
        ...item,
        enterpriseName: auth.state.enterprises.find(
          (enterprise) => enterprise.id === item.enterpriseId,
        )?.name ?? item.enterpriseName,
      })),
      total: vehicles.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/vehicles/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'vehicle:view')
    if ('response' in auth) return auth.response
    const vehicle = auth.state.vehicles.find((item) => item.id === params.id)
    if (!vehicle) return createErrorResponse(404, 40450, '车辆档案不存在')
    if (
      auth.user.roleCode === 'enterprise_user' && vehicle.enterpriseId !== auth.user.enterpriseId
    ) {
      return createErrorResponse(403, 40307, '无权查看其他企业车辆档案')
    }
    return createSuccessResponse({
      ...vehicle,
      enterpriseName: auth.state.enterprises.find(
        (item) => item.id === vehicle.enterpriseId,
      )?.name ?? vehicle.enterpriseName,
    })
  }),

  http.post('/api/vehicles', ({ request }) => handleVehicleMutation(request)),
  http.put('/api/vehicles/:id', ({ request, params }) =>
    handleVehicleMutation(request, String(params.id)),
  ),

  http.patch('/api/vehicles/:id/status', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'vehicle:status')
    if ('response' in auth) return auth.response
    const vehicle = auth.state.vehicles.find((item) => item.id === params.id)
    if (!vehicle) return createErrorResponse(404, 40450, '车辆档案不存在')
    if (
      auth.user.roleCode === 'enterprise_user' && vehicle.enterpriseId !== auth.user.enterpriseId
    ) {
      return createErrorResponse(403, 40307, '无权启停其他企业车辆档案')
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    if (!body || typeof body !== 'object' || !('status' in body) || !isVehicleStatus(body.status)) {
      return createErrorResponse(400, 40093, '请选择有效的车辆状态')
    }
    vehicle.status = body.status
    vehicle.updatedAt = new Date().toISOString()
    saveMockState(auth.state)
    return createSuccessResponse(vehicle, '车辆状态已更新')
  }),
]
