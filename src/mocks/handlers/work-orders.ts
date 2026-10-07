import { http } from 'msw'

import type {
  WorkOrderAction,
  WorkOrderCreateRequest,
  WorkOrderDto,
  WorkOrderImageDto,
  WorkOrderStatus,
} from '@/types/work-order'
import {
  getWorkOrderActions,
  canEditWorkOrderImages,
  isWorkOrderPriority,
  isWorkOrderStatus,
  isWorkOrderType,
  workOrderActionLabels,
} from '@/utils/work-order'
import type { MockUserEntity } from '../data/users'
import { workOrderSampleImages } from '../data/work-orders'
import { saveMockState, type MockState } from '../store'
import {
  authorizeRequest,
  createErrorResponse,
  createSuccessResponse,
  getUserPermissions,
} from '../utils'

const metricStatuses: WorkOrderStatus[] = [
  'pending_acceptance',
  'pending_processing',
  'processing',
  'pending_confirmation',
  'completed',
]

/** 企业用户只可查看或操作本企业工单 */
function getScopedOrders(state: MockState, user: MockUserEntity) {
  return state.workOrders.filter(
    (order) => user.roleCode !== 'enterprise_user' || order.enterpriseId === user.enterpriseId,
  )
}

/** 分页参数只允许正整数 */
function parsePage(value: string | null, fallback: number) {
  const number = value === null ? fallback : Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

/** 校验附件数量、标识和资源地址，仅接受本地示例及小体积图片 data URL */
function validateImages(value: unknown): WorkOrderImageDto[] | string {
  if (!Array.isArray(value) || value.length > 5) return '最多上传 5 张图片'
  const ids = new Set<string>()
  const images: WorkOrderImageDto[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return '图片资料格式不正确'
    const { id, name, url } = item as Record<string, unknown>
    if (
      typeof id !== 'string' ||
      !/^[\w-]{1,100}$/.test(id) ||
      ids.has(id) ||
      typeof name !== 'string' ||
      !name.trim() ||
      name.length > 80 ||
      typeof url !== 'string' ||
      url.length > 350_000 ||
      (!workOrderSampleImages.some((image) => image.url === url) &&
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(url))
    )
      return '图片资料不正确，请重新上传'
    ids.add(id)
    images.push({ id, name: name.trim(), url })
  }
  return images
}

/** 将上传文件转换为可跨刷新展示的模拟地址 */
async function readImageUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  }
  return `data:${file.type};base64,${btoa(binary)}`
}

/** 服务端再次校验创建资料，避免直接调用接口绕过表单规则 */
function validateCreatePayload(body: unknown): WorkOrderCreateRequest | string {
  if (!body || typeof body !== 'object') return '请求参数格式不正确'
  const values = body as Record<string, unknown>
  const limits = {
    title: 60,
    description: 1000,
    enterpriseId: 100,
    contactName: 30,
    contactPhone: 11,
    location: 100,
  }
  for (const [key, limit] of Object.entries(limits)) {
    const value = values[key]
    if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) {
      return '请完整填写工单资料，并遵守字段长度限制'
    }
  }
  if (!isWorkOrderType(values.type) || !isWorkOrderPriority(values.priority)) {
    return '请选择有效的工单类型和紧急程度'
  }
  if (!/^1\d{10}$/.test(String(values.contactPhone).trim())) return '请输入有效的 11 位手机号'
  const images = validateImages(values.images)
  if (typeof images === 'string') return images
  return {
    title: String(values.title).trim(),
    description: String(values.description).trim(),
    enterpriseId: String(values.enterpriseId).trim(),
    contactName: String(values.contactName).trim(),
    contactPhone: String(values.contactPhone).trim(),
    location: String(values.location).trim(),
    type: values.type,
    priority: values.priority,
    images,
  }
}

/** 工单模拟接口，支持分页、数据隔离、统计及完整流程，并持久化变更 */
export const workOrderHandlers = [
  http.post('/api/work-orders/images/sample', async ({ request }) => {
    const auth = authorizeRequest(request, 'work-order:create')
    if ('response' in auth) return auth.response
    try {
      const body = (await request.json()) as { sampleIndex?: unknown }
      if (
        !Number.isInteger(body?.sampleIndex) ||
        Number(body.sampleIndex) < 0 ||
        Number(body.sampleIndex) > 2
      ) {
        return createErrorResponse(400, 400108, '请选择有效的示例图片')
      }
      return createSuccessResponse(
        {
          ...workOrderSampleImages[Number(body.sampleIndex)],
          id: `image_${crypto.randomUUID()}`,
        },
        '图片上传成功',
        201,
      )
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
  }),
  http.post('/api/work-orders/images', async ({ request }) => {
    const auth = authorizeRequest(request, 'work-order:create')
    if ('response' in auth) return auth.response
    try {
      const data = await request.formData()
      const file = data.get('file')
      if (
        !(file instanceof File) ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size === 0 ||
        file.size > 256 * 1024 ||
        file.name.length > 80
      )
        return createErrorResponse(
          400,
          400108,
          '请上传压缩后不超过 256 KB 的 JPG、PNG 或 WebP 图片',
        )
      return createSuccessResponse<WorkOrderImageDto>(
        {
          id: `image_${crypto.randomUUID()}`,
          name: file.name,
          url: await readImageUrl(file),
        },
        '图片上传成功',
        201,
      )
    } catch {
      return createErrorResponse(400, 400108, '图片读取失败，请重新上传')
    }
  }),
  http.get('/api/work-orders/options', async ({ request }) => {
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    return createSuccessResponse({
      enterprises: auth.state.enterprises
        .filter(
          (item) => auth.user.roleCode !== 'enterprise_user' || item.id === auth.user.enterpriseId,
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
          contactName: item.contactName,
          contactPhone: item.contactPhone.replace(/\s/g, ''),
        })),
      assignees:
        auth.user.roleCode === 'enterprise_user'
          ? []
          : auth.state.users
              .filter(
                (user) =>
                  user.status === 'active' &&
                  getUserPermissions(auth.state, user).includes('work-order:process'),
              )
              .map((user) => ({ id: user.id, name: user.name })),
    })
  }),
  http.get('/api/work-orders/summary', async ({ request }) => {
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    const orders = getScopedOrders(auth.state, auth.user)
    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000
    return createSuccessResponse(
      metricStatuses.map((status) => {
        const count = orders.filter((order) => order.status === status).length
        // 以一周前最后一次操作后的状态还原历史数量，尚未创建的工单不计入
        const previousCount = orders.filter(
          (order) =>
            order.history.filter((entry) => Date.parse(entry.occurredAt) <= lastWeek).at(-1)
              ?.status === status,
        ).length
        return { status, count, change: count - previousCount }
      }),
    )
  }),
  http.get('/api/work-orders', async ({ request }) => {
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    const query = new URL(request.url).searchParams
    const page = parsePage(query.get('page'), 1)
    const pageSize = parsePage(query.get('pageSize'), 20)
    const code = query.get('code')?.trim().toUpperCase()
    const type = query.get('type')
    const status = query.get('status')
    const enterpriseId = query.get('enterpriseId')
    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 400100, '分页参数不正确，每页最多查询 100 条')
    }
    if ((type && !isWorkOrderType(type)) || (status && !isWorkOrderStatus(status))) {
      return createErrorResponse(400, 400101, '工单类型或状态筛选条件不正确')
    }
    const orders = getScopedOrders(auth.state, auth.user)
      .filter(
        (order) =>
          (!code || order.code.includes(code)) &&
          (!type || order.type === type) &&
          (!status || order.status === status) &&
          (!enterpriseId || order.enterpriseId === enterpriseId),
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: orders.slice(start, start + pageSize),
      total: orders.length,
      page,
      pageSize,
    })
  }),
  http.get('/api/work-orders/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    const order = getScopedOrders(auth.state, auth.user).find((item) => item.id === params.id)
    if (!order) return createErrorResponse(404, 404100, '工单不存在或无权查看')
    return createSuccessResponse(order)
  }),
  http.patch('/api/work-orders/:id/images', async ({ request, params }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    // 读取请求体后获取最新状态，避免并发流程操作被过期图片请求覆盖
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    const order = getScopedOrders(auth.state, auth.user).find((item) => item.id === params.id)
    if (!order) return createErrorResponse(404, 404100, '工单不存在或无权操作')
    if (!canEditWorkOrderImages(order, getUserPermissions(auth.state, auth.user))) {
      return createErrorResponse(403, 403100, '当前角色或工单状态不允许修改图片')
    }
    const images = validateImages(
      body && typeof body === 'object' && 'images' in body ? body.images : null,
    )
    if (typeof images === 'string') return createErrorResponse(400, 400108, images)
    order.images = images
    order.updatedAt = new Date().toISOString()
    try {
      saveMockState(auth.state)
    } catch {
      return createErrorResponse(507, 507100, '浏览器存储空间不足，请减少图片后重试')
    }
    return createSuccessResponse(order, '图片已保存')
  }),
  http.post('/api/work-orders', async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    const auth = authorizeRequest(request, 'work-order:create')
    if ('response' in auth) return auth.response
    const payload = validateCreatePayload(body)
    if (typeof payload === 'string') return createErrorResponse(400, 400102, payload)
    const enterprise = auth.state.enterprises.find((item) => item.id === payload.enterpriseId)
    if (!enterprise) return createErrorResponse(400, 400103, '所属企业不存在')
    if (auth.user.roleCode === 'enterprise_user' && enterprise.id !== auth.user.enterpriseId) {
      return createErrorResponse(403, 40307, '无权为其他企业创建工单')
    }
    const now = new Date().toISOString()
    const dateCode = now.slice(0, 10).replaceAll('-', '')
    let sequence = auth.state.workOrders.length + 1
    while (
      auth.state.workOrders.some(
        (item) => item.code === `GD${dateCode}${String(sequence).padStart(4, '0')}`,
      )
    ) {
      sequence += 1
    }
    const order: WorkOrderDto = {
      ...payload,
      id: `wo_${crypto.randomUUID()}`,
      code: `GD${dateCode}${String(sequence).padStart(4, '0')}`,
      enterpriseName: enterprise.name,
      status: 'pending_acceptance',
      assigneeId: null,
      assigneeName: null,
      creatorName: auth.user.name,
      createdAt: now,
      updatedAt: now,
      rating: null,
      feedback: '',
      history: [
        {
          id: crypto.randomUUID(),
          action: 'create',
          operatorName: auth.user.name,
          occurredAt: now,
          remark: '提交工单，等待园区受理',
          status: 'pending_acceptance',
        },
      ],
    }
    auth.state.workOrders.unshift(order)
    try {
      saveMockState(auth.state)
    } catch {
      return createErrorResponse(507, 507100, '浏览器存储空间不足，请减少图片后重试')
    }
    return createSuccessResponse(order, '工单创建成功', 201)
  }),
  http.patch('/api/work-orders/:id/actions', async ({ request, params }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    }
    // 校验当前持久化状态，阻止并发请求重复执行同一阶段的操作
    const auth = authorizeRequest(request, 'work-order:view')
    if ('response' in auth) return auth.response
    const order = getScopedOrders(auth.state, auth.user).find((item) => item.id === params.id)
    if (!order) return createErrorResponse(404, 404100, '工单不存在或无权操作')
    if (!body || typeof body !== 'object')
      return createErrorResponse(400, 40001, '请求参数格式不正确')
    const values = body as Record<string, unknown>
    const action = values.action as WorkOrderAction
    if (
      typeof action !== 'string' ||
      action === ('create' as string) ||
      !Object.hasOwn(workOrderActionLabels, action)
    ) {
      return createErrorResponse(400, 400104, '工单操作不正确')
    }
    if (values.expectedStatus !== order.status) {
      return createErrorResponse(409, 409100, '工单状态已变化，请刷新后重试')
    }
    const availableActions = getWorkOrderActions(
      order,
      getUserPermissions(auth.state, auth.user),
      auth.user.id,
    )
    if (!availableActions.includes(action)) {
      return createErrorResponse(403, 403100, '当前角色或工单状态不允许执行此操作')
    }
    if (
      values.remark != null &&
      (typeof values.remark !== 'string' || values.remark.length > 1000)
    ) {
      return createErrorResponse(400, 400105, '操作说明不能超过 1000 字')
    }
    let remark = typeof values.remark === 'string' ? values.remark.trim() : ''
    if (['submit', 'cancel', 'reopen'].includes(action) && !remark) {
      return createErrorResponse(400, 400105, '请填写操作说明')
    }
    if (
      values.rating != null &&
      (action !== 'confirm' ||
        typeof values.rating !== 'number' ||
        !Number.isInteger(values.rating) ||
        values.rating < 1 ||
        values.rating > 5)
    ) {
      return createErrorResponse(400, 400106, '评价分数必须为 1～5 的整数')
    }
    if (action === 'accept' || action === 'assign') {
      const assignee = auth.state.users.find(
        (user) =>
          user.id === values.assigneeId &&
          user.status === 'active' &&
          getUserPermissions(auth.state, user).includes('work-order:process'),
      )
      if (!assignee) return createErrorResponse(400, 400107, '请选择有效的处理人')
      order.assigneeId = assignee.id
      order.assigneeName = assignee.name
      remark = `分派给${assignee.name}${remark ? `；${remark}` : ''}`
    }
    const nextStatuses: Record<WorkOrderAction, WorkOrderStatus> = {
      accept: 'pending_processing',
      assign: 'pending_processing',
      start: 'processing',
      submit: 'pending_confirmation',
      confirm: 'completed',
      cancel: 'cancelled',
      reopen: 'pending_acceptance',
    }
    order.status = nextStatuses[action]
    order.updatedAt = new Date().toISOString()
    if (action === 'confirm') {
      order.rating = typeof values.rating === 'number' ? values.rating : null
      order.feedback = remark
    }
    if (action === 'reopen') {
      order.assigneeId = null
      order.assigneeName = null
      order.rating = null
      order.feedback = ''
    }
    order.history.push({
      id: crypto.randomUUID(),
      action,
      operatorName: auth.user.name,
      occurredAt: order.updatedAt,
      remark: remark || workOrderActionLabels[action],
      status: order.status,
    })
    try {
      saveMockState(auth.state)
    } catch {
      return createErrorResponse(507, 507100, '浏览器存储空间不足，请清理浏览器存储后重试')
    }
    return createSuccessResponse(order, '工单操作成功')
  }),
]
