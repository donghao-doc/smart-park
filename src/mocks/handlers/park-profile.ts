import { http } from 'msw'
import type { ParkSpaceStatus, UpdateParkInfoRequest } from '@/types/park-profile'
import { parkBuildings, parkSpaces } from '../data/park-profile'
import { getMockState, saveMockState } from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/**
 * 组装园区档案汇总数据
 */
function createParkProfileData() {
  return {
    info: { ...getMockState().parkInfo },
    summary: {
      buildingCount: parkBuildings.length,
      floorCount: parkBuildings.reduce((total, building) => total + building.floors.length, 0),
      spaceCount: 1_200,
      usedSpaceCount: 960,
    },
    buildings: parkBuildings.map((building) => ({
      ...building,
      floors: building.floors.map((floor) => ({ ...floor })),
    })),
  }
}

/**
 * 判断空间状态查询值是否合法
 */
function isParkSpaceStatus(value: string | null): value is ParkSpaceStatus {
  return value === 'used' || value === 'vacant'
}

/**
 * 校验园区基础信息编辑参数
 */
function validateUpdatePayload(body: Partial<UpdateParkInfoRequest>) {
  if (
    !body.name?.trim() ||
    !body.address?.trim() ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim() ||
    !body.description?.trim()
  ) {
    return '请完整填写园区基础信息'
  }

  if (!body.area || !Number.isFinite(body.area) || body.area <= 0) {
    return '园区面积必须大于 0'
  }

  return null
}

/** 园区档案模拟接口 */
export const parkProfileHandlers = [
  http.get('/api/park/profile', async ({ request }) => {
    const auth = authorizeRequest(request, 'park:view')
    if ('response' in auth) {
      return auth.response
    }

    return createSuccessResponse(createParkProfileData())
  }),

  http.put('/api/park/profile', async ({ request }) => {
    const auth = authorizeRequest(request, 'park:update')
    if ('response' in auth) {
      return auth.response
    }

    let body: Partial<UpdateParkInfoRequest>
    try {
      body = (await request.json()) as Partial<UpdateParkInfoRequest>
    } catch {
      return createErrorResponse(400, 40030, '请求参数格式不正确')
    }

    const validationMessage = validateUpdatePayload(body)
    if (validationMessage) {
      return createErrorResponse(400, 40031, validationMessage)
    }

    auth.state.parkInfo = {
      ...auth.state.parkInfo,
      name: body.name!.trim(),
      address: body.address!.trim(),
      contactName: body.contactName!.trim(),
      contactPhone: body.contactPhone!.trim(),
      area: body.area!,
      description: body.description!.trim(),
    }
    saveMockState(auth.state)

    return createSuccessResponse(createParkProfileData(), '园区信息更新成功')
  }),

  http.get('/api/park/spaces', async ({ request }) => {
    const auth = authorizeRequest(request, 'park:view')
    if ('response' in auth) {
      return auth.response
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '8')
    const locationId = url.searchParams.get('locationId')?.trim()
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase()

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      return createErrorResponse(400, 40032, '分页参数不正确')
    }

    if (status && !isParkSpaceStatus(status)) {
      return createErrorResponse(400, 40033, '空间状态不正确')
    }

    const filteredSpaces = parkSpaces.filter((space) => {
      const matchesLocation =
        !locationId || space.buildingId === locationId || space.floorId === locationId
      const matchesStatus = !status || space.status === status
      const matchesKeyword =
        !keyword ||
        space.name.toLowerCase().includes(keyword) ||
        space.buildingName.toLowerCase().includes(keyword)

      return matchesLocation && matchesStatus && matchesKeyword
    })

    const start = (page - 1) * pageSize
    return createSuccessResponse({
      items: filteredSpaces.slice(start, start + pageSize).map((space) => ({ ...space })),
      total: filteredSpaces.length,
      page,
      pageSize,
    })
  }),
]
