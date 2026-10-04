import { http } from 'msw'
import type {
  PersonnelCertificateType,
  PersonnelMutationRequest,
  PersonnelStatus,
  UpdatePersonnelStatusRequest,
} from '@/types/personnel'
import { saveMockState } from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/**
 * 判断人员状态查询值是否合法
 */
function isPersonnelStatus(value: unknown): value is PersonnelStatus {
  return value === 'active' || value === 'resigned' || value === 'suspended'
}

/**
 * 判断证件类型是否合法
 */
function isCertificateType(value: unknown): value is PersonnelCertificateType {
  return value === 'identity_card' || value === 'passport' || value === 'hk_macao_permit'
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
 * 校验人员新增和编辑参数
 */
function validatePersonnelPayload(body: Partial<PersonnelMutationRequest>) {
  if (!body.name?.trim() || body.name.trim().length > 30) {
    return '姓名不能为空且不能超过 30 个字符'
  }

  if (!/^1\d{10}$/.test(body.phone?.trim() ?? '')) {
    return '请输入有效的 11 位手机号码'
  }

  if (!isCertificateType(body.certificateType) || !body.certificateNumber?.trim()) {
    return '请填写有效的证件信息'
  }

  if (!body.employeeNumber?.trim() || !body.enterpriseId || !body.department?.trim()) {
    return '请完整填写人员任职信息'
  }

  if (!isPersonnelStatus(body.status)) {
    return '请选择有效的人员状态'
  }

  return null
}

/**
 * 校验企业用户只能访问所属企业人员
 */
function canAccessPersonnel(
  userEnterpriseId: string | null,
  roleCode: string,
  targetEnterpriseId: string,
) {
  return roleCode !== 'enterprise_user' || userEnterpriseId === targetEnterpriseId
}

/** 人员管理模拟接口 */
export const personnelHandlers = [
  http.get('/api/personnel', async ({ request }) => {
    const auth = authorizeRequest(request, 'personnel:view')
    if ('response' in auth) {
      return auth.response
    }

    const url = new URL(request.url)
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 20)
    const name = url.searchParams.get('name')?.trim().toLowerCase()
    const phone = url.searchParams.get('phone')?.trim()
    const enterpriseId = url.searchParams.get('enterpriseId')?.trim()
    const status = url.searchParams.get('status')

    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40050, '分页参数不正确，每页最多查询 100 条')
    }

    if (status && !isPersonnelStatus(status)) {
      return createErrorResponse(400, 40051, '人员状态筛选条件不正确')
    }

    const scopedPersonnel =
      auth.user.roleCode === 'enterprise_user'
        ? auth.state.personnel.filter((item) => item.enterpriseId === auth.user.enterpriseId)
        : auth.state.personnel
    const filteredPersonnel = scopedPersonnel.filter((item) => {
      const matchesName = !name || item.name.toLowerCase().includes(name)
      const matchesPhone = !phone || item.phone.includes(phone)
      const matchesEnterprise = !enterpriseId || item.enterpriseId === enterpriseId
      const matchesStatus = !status || item.status === status
      return matchesName && matchesPhone && matchesEnterprise && matchesStatus
    })
    const start = (page - 1) * pageSize

    return createSuccessResponse({
      list: filteredPersonnel.slice(start, start + pageSize),
      total: filteredPersonnel.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/personnel/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'personnel:view')
    if ('response' in auth) {
      return auth.response
    }

    const personnel = auth.state.personnel.find((item) => item.id === params.id)
    if (!personnel) {
      return createErrorResponse(404, 40420, '人员不存在')
    }

    if (!canAccessPersonnel(auth.user.enterpriseId, auth.user.roleCode, personnel.enterpriseId)) {
      return createErrorResponse(403, 40304, '无权访问其他企业人员数据')
    }

    return createSuccessResponse(personnel)
  }),

  http.post('/api/personnel', async ({ request }) => {
    const auth = authorizeRequest(request, 'personnel:create')
    if ('response' in auth) {
      return auth.response
    }

    let body: Partial<PersonnelMutationRequest>
    try {
      body = (await request.json()) as Partial<PersonnelMutationRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationMessage = validatePersonnelPayload(body)
    if (validationMessage) {
      return createErrorResponse(400, 40052, validationMessage)
    }

    const enterprise = auth.state.enterprises.find((item) => item.id === body.enterpriseId)
    if (!enterprise) {
      return createErrorResponse(400, 40053, '所属企业不存在')
    }

    if (auth.state.personnel.some((item) => item.employeeNumber === body.employeeNumber?.trim())) {
      return createErrorResponse(409, 40920, '工号已存在')
    }

    if (
      auth.state.personnel.some(
        (item) => item.certificateNumber === body.certificateNumber?.trim().toUpperCase(),
      )
    ) {
      return createErrorResponse(409, 40921, '证件号码已存在')
    }

    const now = new Date().toISOString()
    const personnel = {
      id: `per_${crypto.randomUUID()}`,
      name: body.name!.trim(),
      phone: body.phone!.trim(),
      certificateType: body.certificateType!,
      certificateNumber: body.certificateNumber!.trim().toUpperCase(),
      employeeNumber: body.employeeNumber!.trim().toUpperCase(),
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      department: body.department!.trim(),
      status: body.status!,
      createdAt: now,
      updatedAt: now,
    }

    auth.state.personnel.unshift(personnel)
    saveMockState(auth.state)
    return createSuccessResponse(personnel, '人员创建成功', 201)
  }),

  http.put('/api/personnel/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'personnel:update')
    if ('response' in auth) {
      return auth.response
    }

    const personnel = auth.state.personnel.find((item) => item.id === params.id)
    if (!personnel) {
      return createErrorResponse(404, 40420, '人员不存在')
    }

    let body: Partial<PersonnelMutationRequest>
    try {
      body = (await request.json()) as Partial<PersonnelMutationRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationMessage = validatePersonnelPayload(body)
    if (validationMessage) {
      return createErrorResponse(400, 40052, validationMessage)
    }

    const enterprise = auth.state.enterprises.find((item) => item.id === body.enterpriseId)
    if (!enterprise) {
      return createErrorResponse(400, 40053, '所属企业不存在')
    }

    const hasDuplicateEmployeeNumber = auth.state.personnel.some(
      (item) => item.id !== personnel.id && item.employeeNumber === body.employeeNumber?.trim(),
    )
    if (hasDuplicateEmployeeNumber) {
      return createErrorResponse(409, 40920, '工号已存在')
    }

    const hasDuplicateCertificateNumber = auth.state.personnel.some(
      (item) =>
        item.id !== personnel.id &&
        item.certificateNumber === body.certificateNumber?.trim().toUpperCase(),
    )
    if (hasDuplicateCertificateNumber) {
      return createErrorResponse(409, 40921, '证件号码已存在')
    }

    Object.assign(personnel, {
      name: body.name!.trim(),
      phone: body.phone!.trim(),
      certificateType: body.certificateType!,
      certificateNumber: body.certificateNumber!.trim().toUpperCase(),
      employeeNumber: body.employeeNumber!.trim().toUpperCase(),
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      department: body.department!.trim(),
      status: body.status!,
      updatedAt: new Date().toISOString(),
    })
    saveMockState(auth.state)
    return createSuccessResponse(personnel, '人员信息已更新')
  }),

  http.patch('/api/personnel/:id/status', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'personnel:status')
    if ('response' in auth) {
      return auth.response
    }

    const personnel = auth.state.personnel.find((item) => item.id === params.id)
    if (!personnel) {
      return createErrorResponse(404, 40420, '人员不存在')
    }

    let body: Partial<UpdatePersonnelStatusRequest>
    try {
      body = (await request.json()) as Partial<UpdatePersonnelStatusRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    if (!isPersonnelStatus(body.status)) {
      return createErrorResponse(400, 40051, '人员状态不正确')
    }

    personnel.status = body.status
    personnel.updatedAt = new Date().toISOString()
    saveMockState(auth.state)
    return createSuccessResponse(personnel, '人员状态已更新')
  }),
]
