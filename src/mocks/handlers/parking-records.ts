import dayjs from 'dayjs'
import { http } from 'msw'

import type { ParkingRecordDto, ParkingRecordSummaryDto } from '@/types/parking-record'
import { normalizeVehiclePlate } from '@/utils/vehicle'
import { seedParkingRecords } from '../data/parking-records'
import type { MockUserEntity } from '../data/users'
import { authorizeRequest, createErrorResponse, createSuccessResponse } from '../utils'

/** 按账号归属隔离企业数据，并根据当前时刻更新超时状态 */
function getScopedRecords(user: MockUserEntity): ParkingRecordDto[] {
  return seedParkingRecords
    .filter(
      (record) => user.roleCode !== 'enterprise_user' || record.enterpriseId === user.enterpriseId,
    )
    .map((record) =>
      record.status === 'parked' && dayjs().diff(record.enteredAt, 'hour') >= 24
        ? { ...record, status: 'overtime' as const }
        : record,
    )
    .sort((a, b) => dayjs(b.enteredAt).valueOf() - dayjs(a.enteredAt).valueOf())
}

/** 校验正整数分页参数，省略时使用默认值 */
function parsePage(value: string | null, fallback: number) {
  if (value === null) return fallback
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? Number(value)
    : null
}

/** 校验包含时区的 ISO 时间，避免非法日期被自动纠正 */
function isValidTime(value: string | null) {
  if (value === null) return true
  const date = new Date(value)
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString() === value
  )
}

/** 判断指定时刻车辆是否已经入场且尚未离场，拦截记录始终排除 */
function isParkedAt(record: ParkingRecordDto, time: number) {
  return (
    record.status !== 'unauthorized' &&
    Date.parse(record.enteredAt) <= time &&
    (!record.exitedAt || Date.parse(record.exitedAt) > time)
  )
}

/** 计算百分比变化，无比较基数时返回空值 */
function calculateChange(current: number, previous: number) {
  return previous === 0 ? null : Math.round(((current - previous) / previous) * 100)
}

/** 停车记录只读模拟接口，统一执行通行查看权限和企业隔离 */
export const parkingRecordHandlers = [
  http.get('/api/parking-records/summary', async ({ request }) => {
    const auth = authorizeRequest(request, 'parking-record:view')
    if ('response' in auth) return auth.response

    const records = getScopedRecords(auth.user)
    const now = dayjs()
    const yesterday = now.subtract(1, 'day')
    const countDaily = (field: 'enteredAt' | 'exitedAt', date: string) =>
      records.filter(
        (record) =>
          record.status !== 'unauthorized' &&
          record[field] &&
          dayjs(record[field]).format('YYYY-MM-DD') === date,
      ).length
    const countAbnormal = (time: typeof now) =>
      records.filter((record) =>
        record.status === 'unauthorized'
          ? dayjs(record.enteredAt).isSame(time, 'day') &&
            Date.parse(record.enteredAt) <= time.valueOf()
          : isParkedAt(record, time.valueOf()) && time.diff(record.enteredAt, 'hour') >= 24,
      ).length
    const today = now.format('YYYY-MM-DD')
    const yesterdayDate = yesterday.format('YYYY-MM-DD')
    const currentParked = records.filter((record) => isParkedAt(record, now.valueOf())).length
    const todayEntries = countDaily('enteredAt', today)
    const todayExits = countDaily('exitedAt', today)
    const abnormalVehicles = countAbnormal(now)

    return createSuccessResponse<ParkingRecordSummaryDto>({
      currentParked,
      parkedChange:
        currentParked -
        records.filter((record) => isParkedAt(record, now.subtract(7, 'day').valueOf())).length,
      todayEntries,
      todayExits,
      abnormalVehicles,
      entriesChangePercent: calculateChange(todayEntries, countDaily('enteredAt', yesterdayDate)),
      exitsChangePercent: calculateChange(todayExits, countDaily('exitedAt', yesterdayDate)),
      abnormalChangePercent: calculateChange(abnormalVehicles, countAbnormal(yesterday)),
    })
  }),
  http.get('/api/parking-records', async ({ request }) => {
    const auth = authorizeRequest(request, 'parking-record:view')
    if ('response' in auth) return auth.response

    const params = new URL(request.url).searchParams
    const page = parsePage(params.get('page'), 1)
    const pageSize = parsePage(params.get('pageSize'), 20)
    const plateNumber = normalizeVehiclePlate(params.get('plateNumber') ?? '')
    const vehicleType = params.get('vehicleType')
    const status = params.get('status')
    const startTime = params.get('startTime')
    const endTime = params.get('endTime')

    if (!page || !pageSize || pageSize > 100) {
      return createErrorResponse(400, 40080, '分页参数不正确，每页最多查询 100 条')
    }
    if (vehicleType && !['small', 'large', 'temporary'].includes(vehicleType)) {
      return createErrorResponse(400, 40081, '车辆类型筛选条件不正确')
    }
    if (status && !['parked', 'departed', 'overtime', 'unauthorized'].includes(status)) {
      return createErrorResponse(400, 40082, '停车状态筛选条件不正确')
    }
    if (
      !isValidTime(startTime) ||
      !isValidTime(endTime) ||
      (startTime && endTime && Date.parse(startTime) > Date.parse(endTime))
    ) {
      return createErrorResponse(400, 40083, '请选择有效的入场时间范围')
    }

    const records = getScopedRecords(auth.user).filter(
      (record) =>
        (!plateNumber || record.plateNumber.includes(plateNumber)) &&
        (!vehicleType || record.vehicleType === vehicleType) &&
        (!status || record.status === status) &&
        (!startTime || Date.parse(record.enteredAt) >= Date.parse(startTime)) &&
        (!endTime || Date.parse(record.enteredAt) <= Date.parse(endTime)),
    )
    const start = (page - 1) * pageSize
    return createSuccessResponse({
      list: records.slice(start, start + pageSize),
      total: records.length,
      page,
      pageSize,
    })
  }),
  http.get('/api/parking-records/:id', async ({ request, params }) => {
    const auth = authorizeRequest(request, 'parking-record:view')
    if ('response' in auth) return auth.response

    const record = getScopedRecords(auth.user).find((item) => item.id === params.id)
    if (!record) return createErrorResponse(404, 40450, '停车记录不存在或无权查看')
    return createSuccessResponse(record)
  }),
]
