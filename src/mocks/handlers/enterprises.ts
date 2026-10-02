import { delay, http } from 'msw'
import type {
  EnterpriseDetailDto,
  EnterpriseMutationRequest,
  EnterpriseStatus,
} from '../../types/enterprise'
import { saveMockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  mockResponseDelay,
} from '../utils'

const creditCodePattern = /^[0-9A-Z]{18}$/

/**
 * 判断企业状态查询值是否合法
 */
function isEnterpriseStatus(value: unknown): value is EnterpriseStatus {
  return value === 'active' || value === 'disabled'
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
 * 将企业实体转换为列表返回结构
 */
function toEnterpriseListItem(enterprise: EnterpriseDetailDto) {
  return {
    id: enterprise.id,
    name: enterprise.name,
    creditCode: enterprise.creditCode,
    industry: enterprise.industry,
    contactName: enterprise.contactName,
    contactPhone: enterprise.contactPhone,
    officeLocation: enterprise.officeLocation,
    status: enterprise.status,
  }
}

/**
 * 校验企业新增和编辑参数
 */
function validateEnterprisePayload(
  body: Partial<EnterpriseMutationRequest>,
  creditCodes: string[],
) {
  if (!body.name?.trim() || body.name.trim().length > 60) {
    return '企业名称不能为空且不能超过 60 个字符'
  }

  const creditCode = body.creditCode?.trim().toUpperCase() ?? ''
  if (!creditCodePattern.test(creditCode)) {
    return '统一社会信用代码必须为 18 位大写字母或数字'
  }

  if (creditCodes.includes(creditCode)) {
    return '统一社会信用代码已存在'
  }

  if (
    !body.industry?.trim() ||
    !body.companyType?.trim() ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim() ||
    !body.officeLocation?.trim()
  ) {
    return '请完整填写企业基础信息'
  }

  if (!isEnterpriseStatus(body.status)) {
    return '请选择有效的企业状态'
  }

  return null
}

/**
 * 校验企业用户只能访问所属企业
 */
function canAccessEnterprise(userEnterpriseId: string | null, roleCode: string, targetId: string) {
  return roleCode !== 'enterprise_user' || userEnterpriseId === targetId
}

/**
 * 将 11 位手机号格式化为详情页易读文本
 */
function formatContactPhone(value: string) {
  const digits = value.replace(/\s/g, '')
  return /^\d{11}$/.test(digits)
    ? `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
    : value
}

/** 企业管理模拟接口 */
export const enterpriseHandlers = [
  http.get('/api/enterprises', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'enterprise:view')
    if ('response' in auth) {
      return auth.response
    }

    const url = new URL(request.url)
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 10)
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase()
    const status = url.searchParams.get('status')

    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40040, '分页参数不正确，每页最多查询 100 条')
    }

    if (status && !isEnterpriseStatus(status)) {
      return createErrorResponse(400, 40041, '企业状态筛选条件不正确')
    }

    const scopedEnterprises =
      auth.user.roleCode === 'enterprise_user'
        ? auth.state.enterprises.filter((item) => item.id === auth.user.enterpriseId)
        : auth.state.enterprises
    const filteredEnterprises = scopedEnterprises.filter((enterprise) => {
      const matchesKeyword = !keyword || enterprise.name.toLowerCase().includes(keyword)
      const matchesStatus = !status || enterprise.status === status
      return matchesKeyword && matchesStatus
    })

    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: filteredEnterprises
        .slice(start, start + pageSize)
        .map((enterprise) => toEnterpriseListItem(enterprise)),
      total: filteredEnterprises.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/enterprises/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'enterprise:view')
    if ('response' in auth) {
      return auth.response
    }

    const enterprise = auth.state.enterprises.find((item) => item.id === params.id)
    if (!enterprise) {
      return createErrorResponse(404, 40410, '企业不存在')
    }

    if (!canAccessEnterprise(auth.user.enterpriseId, auth.user.roleCode, enterprise.id)) {
      return createErrorResponse(403, 40303, '无权访问其他企业数据')
    }

    return createSuccessResponse(enterprise)
  }),

  http.post('/api/enterprises', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'enterprise:create')
    if ('response' in auth) {
      return auth.response
    }

    let body: Partial<EnterpriseMutationRequest>
    try {
      body = (await request.json()) as Partial<EnterpriseMutationRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationMessage = validateEnterprisePayload(
      body,
      auth.state.enterprises.map((item) => item.creditCode),
    )
    if (validationMessage) {
      return createErrorResponse(400, 40042, validationMessage)
    }

    const now = new Date().toISOString()
    const enterprise = {
      id: `ent_${crypto.randomUUID()}`,
      name: body.name!.trim(),
      creditCode: body.creditCode!.trim().toUpperCase(),
      industry: body.industry!.trim(),
      companyType: body.companyType!.trim(),
      contactName: body.contactName!.trim(),
      contactPhone: body.contactPhone!.trim(),
      officeLocation: body.officeLocation!.trim(),
      status: body.status!,
      registeredCapital: '待完善',
      foundedAt: now.slice(0, 10),
      businessScope: '待完善',
      description: `${body.name!.trim()}的企业简介待完善。`,
      contact: {
        name: body.contactName!.trim(),
        title: '企业联系人',
        phone: body.contactPhone!.trim(),
        telephone: '待完善',
        email: '待完善',
        address: body.officeLocation!.trim(),
      },
      office: {
        parkName: '智慧园区',
        buildingName: body.officeLocation!.trim(),
        floorName: '待完善',
        roomName: '待完善',
        address: body.officeLocation!.trim(),
      },
      metrics: {
        memberCount: 0,
        vehicleCount: 0,
        workOrderCount: 0,
        tenancyDuration: '刚刚入驻',
      },
      activities: [
        {
          id: `act_${crypto.randomUUID()}`,
          occurredAt: now,
          content: '企业完成入驻登记',
        },
      ],
      members: [],
      vehicles: [],
      workOrders: [],
      createdAt: now,
      updatedAt: now,
    }

    auth.state.enterprises.unshift(enterprise)
    saveMockState(auth.state)
    return createSuccessResponse(enterprise, '企业创建成功', 201)
  }),

  http.put('/api/enterprises/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'enterprise:update')
    if ('response' in auth) {
      return auth.response
    }

    const enterprise = auth.state.enterprises.find((item) => item.id === params.id)
    if (!enterprise) {
      return createErrorResponse(404, 40410, '企业不存在')
    }

    let body: Partial<EnterpriseMutationRequest>
    try {
      body = (await request.json()) as Partial<EnterpriseMutationRequest>
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }

    const validationMessage = validateEnterprisePayload(
      body,
      auth.state.enterprises
        .filter((item) => item.id !== enterprise.id)
        .map((item) => item.creditCode),
    )
    if (validationMessage) {
      return createErrorResponse(400, 40042, validationMessage)
    }

    enterprise.name = body.name!.trim()
    enterprise.creditCode = body.creditCode!.trim().toUpperCase()
    enterprise.industry = body.industry!.trim()
    enterprise.companyType = body.companyType!.trim()
    enterprise.contactName = body.contactName!.trim()
    enterprise.contactPhone = body.contactPhone!.trim()
    enterprise.officeLocation = body.officeLocation!.trim()
    enterprise.status = body.status!
    enterprise.contact.name = enterprise.contactName
    enterprise.contact.phone = formatContactPhone(enterprise.contactPhone)
    enterprise.updatedAt = new Date().toISOString()
    saveMockState(auth.state)
    return createSuccessResponse(enterprise, '企业信息更新成功')
  }),
]
