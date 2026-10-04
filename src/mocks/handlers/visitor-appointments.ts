import { delay, http } from 'msw'
import type { PermissionCode } from '@/types/auth'
import type {
  CreateVisitorAppointmentRequest,
  UpdateVisitorAppointmentStatusRequest,
  VisitorAppointmentAction,
  VisitorAppointmentStatus,
} from '@/types/visitor-appointment'
import { saveMockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  mockResponseDelay,
} from '../utils'

/**
 * 判断访客预约状态查询值是否合法
 */
function isVisitorAppointmentStatus(value: unknown): value is VisitorAppointmentStatus {
  return (
    value === 'pending' ||
    value === 'approved' ||
    value === 'checked_in' ||
    value === 'checked_out' ||
    value === 'rejected' ||
    value === 'cancelled' ||
    value === 'expired'
  )
}

/**
 * 判断访客预约流程动作是否合法
 */
function isVisitorAppointmentAction(value: unknown): value is VisitorAppointmentAction {
  return (
    value === 'approve' ||
    value === 'reject' ||
    value === 'check_in' ||
    value === 'check_out' ||
    value === 'cancel'
  )
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
 * 判断日期筛选值是否使用 YYYY-MM-DD 格式
 */
function isDateValue(value: string | null) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/**
 * 将已超过预约结束时间且未签到的记录更新为已过期
 */
function refreshExpiredAppointments(
  appointments: Array<{
    status: VisitorAppointmentStatus
    scheduledEndAt: string
    updatedAt: string
  }>,
) {
  const now = Date.now()
  let changed = false

  appointments.forEach((appointment) => {
    if (appointment.status === 'approved' && new Date(appointment.scheduledEndAt).getTime() < now) {
      appointment.status = 'expired'
      appointment.updatedAt = new Date().toISOString()
      changed = true
    }
  })

  return changed
}

/**
 * 获取预约动作需要的权限、起始状态和目标状态
 */
function getActionRule(action: VisitorAppointmentAction): {
  permission: PermissionCode
  allowedStatuses: VisitorAppointmentStatus[]
  targetStatus: VisitorAppointmentStatus
} {
  const rules = {
    approve: {
      permission: 'visitor:approve',
      allowedStatuses: ['pending'],
      targetStatus: 'approved',
    },
    reject: {
      permission: 'visitor:approve',
      allowedStatuses: ['pending'],
      targetStatus: 'rejected',
    },
    check_in: {
      permission: 'visitor:check-in',
      allowedStatuses: ['approved'],
      targetStatus: 'checked_in',
    },
    check_out: {
      permission: 'visitor:check-out',
      allowedStatuses: ['checked_in'],
      targetStatus: 'checked_out',
    },
    cancel: {
      permission: 'visitor:cancel',
      allowedStatuses: ['pending', 'approved'],
      targetStatus: 'cancelled',
    },
  } satisfies Record<
    VisitorAppointmentAction,
    {
      permission: PermissionCode
      allowedStatuses: VisitorAppointmentStatus[]
      targetStatus: VisitorAppointmentStatus
    }
  >

  return rules[action]
}

/**
 * 校验创建访客预约时提交的数据
 */
function validateCreatePayload(body: Partial<CreateVisitorAppointmentRequest>) {
  if (!body.visitorName?.trim() || body.visitorName.trim().length > 30) {
    return '访客姓名不能为空且不能超过 30 个字符'
  }

  if (!/^1\d{10}$/.test(body.visitorPhone?.trim() ?? '')) {
    return '请输入有效的 11 位手机号码'
  }

  if (!body.enterpriseId || !body.hostId) {
    return '请选择所属企业和受访人'
  }

  if (!body.visitReason?.trim() || body.visitReason.trim().length > 100) {
    return '访问事由不能为空且不能超过 100 个字符'
  }

  const startTime = new Date(body.scheduledStartAt ?? '').getTime()
  const endTime = new Date(body.scheduledEndAt ?? '').getTime()
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
    return '请选择有效的预约起止时间'
  }

  if (startTime <= Date.now()) {
    return '预约开始时间必须晚于当前时间'
  }

  if (
    body.plateNumber &&
    !/^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5,6}$/.test(body.plateNumber.trim().toUpperCase())
  ) {
    return '请输入有效的车牌号'
  }

  return null
}

/** 访客预约模拟接口 */
export const visitorAppointmentHandlers = [
  http.get('/api/visitor-appointments/summary', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:view')
    if ('response' in auth) {
      return auth.response
    }

    if (refreshExpiredAppointments(auth.state.visitorAppointments)) {
      saveMockState(auth.state)
    }

    const scopedAppointments =
      auth.user.roleCode === 'enterprise_user'
        ? auth.state.visitorAppointments.filter(
            (item) => item.enterpriseId === auth.user.enterpriseId,
          )
        : auth.state.visitorAppointments
    const count = (status: VisitorAppointmentStatus) =>
      scopedAppointments.filter((item) => item.status === status).length
    const includeHistoricalBase = auth.user.roleCode !== 'enterprise_user'

    return createSuccessResponse({
      pending: count('pending'),
      approved: count('approved'),
      checkedIn: count('checked_in') + (includeHistoricalBase ? 250 : 0),
      checkedOut: count('checked_out') + (includeHistoricalBase ? 288 : 0),
      pendingDelta: 6,
      approvedDelta: 12,
      checkedInDelta: -8,
      checkedOutDelta: 20,
    })
  }),

  http.get('/api/visitor-appointments', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:view')
    if ('response' in auth) {
      return auth.response
    }

    if (refreshExpiredAppointments(auth.state.visitorAppointments)) {
      saveMockState(auth.state)
    }

    const url = new URL(request.url)
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 20)
    const visitorName = url.searchParams.get('visitorName')?.trim().toLowerCase()
    const enterpriseId = url.searchParams.get('enterpriseId')?.trim()
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const status = url.searchParams.get('status')

    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40060, '分页参数不正确，每页最多查询 100 条')
    }

    if (status && !isVisitorAppointmentStatus(status)) {
      return createErrorResponse(400, 40061, '预约状态筛选条件不正确')
    }

    if (!isDateValue(startDate) || !isDateValue(endDate)) {
      return createErrorResponse(400, 40062, '预约日期筛选条件不正确')
    }

    const scopedAppointments =
      auth.user.roleCode === 'enterprise_user'
        ? auth.state.visitorAppointments.filter(
            (item) => item.enterpriseId === auth.user.enterpriseId,
          )
        : auth.state.visitorAppointments
    const filteredAppointments = scopedAppointments.filter((item) => {
      const scheduledDate = item.scheduledStartAt.slice(0, 10)
      const matchesVisitor = !visitorName || item.visitorName.toLowerCase().includes(visitorName)
      const matchesEnterprise = !enterpriseId || item.enterpriseId === enterpriseId
      const matchesStartDate = !startDate || scheduledDate >= startDate
      const matchesEndDate = !endDate || scheduledDate <= endDate
      const matchesStatus = !status || item.status === status
      return (
        matchesVisitor && matchesEnterprise && matchesStartDate && matchesEndDate && matchesStatus
      )
    })
    const start = (page - 1) * pageSize

    return createSuccessResponse({
      list: filteredAppointments.slice(start, start + pageSize),
      total: filteredAppointments.length,
      page,
      pageSize,
    })
  }),

  http.post('/api/visitor-appointments', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:create')
    if ('response' in auth) {
      return auth.response
    }

    let body: Partial<CreateVisitorAppointmentRequest>
    try {
      body = (await request.json()) as Partial<CreateVisitorAppointmentRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationMessage = validateCreatePayload(body)
    if (validationMessage) {
      return createErrorResponse(400, 40063, validationMessage)
    }

    if (auth.user.roleCode === 'enterprise_user' && body.enterpriseId !== auth.user.enterpriseId) {
      return createErrorResponse(403, 40305, '企业用户只能为所属企业创建预约')
    }

    const enterprise = auth.state.enterprises.find((item) => item.id === body.enterpriseId)
    if (!enterprise || enterprise.status !== 'active') {
      return createErrorResponse(400, 40064, '所属企业不存在或已停用')
    }

    const host = auth.state.personnel.find((item) => item.id === body.hostId)
    if (!host || host.enterpriseId !== enterprise.id || host.status !== 'active') {
      return createErrorResponse(400, 40065, '受访人不存在、已停用或不属于所选企业')
    }

    const now = new Date().toISOString()
    const sequence = auth.state.visitorAppointments.length + 1
    const appointment = {
      id: `visit_${crypto.randomUUID()}`,
      code: `V${body.scheduledStartAt!.slice(0, 10).replaceAll('-', '')}${String(sequence).padStart(4, '0')}`,
      visitorName: body.visitorName!.trim(),
      visitorPhone: body.visitorPhone!.trim(),
      hostId: host.id,
      hostName: host.name,
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      scheduledStartAt: body.scheduledStartAt!,
      scheduledEndAt: body.scheduledEndAt!,
      visitReason: body.visitReason!.trim(),
      plateNumber: body.plateNumber?.trim().toUpperCase() || null,
      status: 'pending' as const,
      terminationReason: null,
      checkedInAt: null,
      checkedOutAt: null,
      createdBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    }

    auth.state.visitorAppointments.unshift(appointment)
    saveMockState(auth.state)
    return createSuccessResponse(appointment, '访客预约创建成功', 201)
  }),

  http.patch('/api/visitor-appointments/:id/status', async ({ request, params }) => {
    await delay(mockResponseDelay)

    let body: Partial<UpdateVisitorAppointmentStatusRequest>
    try {
      body = (await request.json()) as Partial<UpdateVisitorAppointmentStatusRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    if (!isVisitorAppointmentAction(body.action)) {
      return createErrorResponse(400, 40066, '预约流程动作不正确')
    }

    const actionRule = getActionRule(body.action)
    const auth = authorizeRequest(request, actionRule.permission)
    if ('response' in auth) {
      return auth.response
    }

    const appointment = auth.state.visitorAppointments.find((item) => item.id === params.id)
    if (!appointment) {
      return createErrorResponse(404, 40430, '访客预约不存在')
    }

    if (
      auth.user.roleCode === 'enterprise_user' &&
      appointment.enterpriseId !== auth.user.enterpriseId
    ) {
      return createErrorResponse(403, 40306, '无权操作其他企业的访客预约')
    }

    if (!actionRule.allowedStatuses.includes(appointment.status)) {
      return createErrorResponse(409, 40930, '当前预约状态不支持此操作，请刷新后重试')
    }

    if ((body.action === 'reject' || body.action === 'cancel') && !body.reason?.trim()) {
      return createErrorResponse(400, 40067, '请填写原因')
    }

    const now = new Date().toISOString()
    appointment.status = actionRule.targetStatus
    appointment.updatedAt = now
    appointment.terminationReason = body.reason?.trim() || null
    if (body.action === 'check_in') {
      appointment.checkedInAt = now
    }
    if (body.action === 'check_out') {
      appointment.checkedOutAt = now
    }

    saveMockState(auth.state)
    return createSuccessResponse(appointment, '预约状态已更新')
  }),
]
