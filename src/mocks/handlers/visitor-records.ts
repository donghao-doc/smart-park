import dayjs from 'dayjs'
import { delay, http } from 'msw'

import type { VisitorRecordDto, VisitorRecordStatus, VisitorRecordSummaryDto } from '@/types/visitor-record'
import { seedVisitorRecords } from '../data/visitor-records'
import type { MockUserEntity } from '../data/users'
import type { MockState } from '../store'
import { authorizeRequest, createErrorResponse, createSuccessResponse, mockResponseDelay } from '../utils'

/** 判断查询状态是否属于到访记录 */
function isVisitorRecordStatus(value: unknown): value is VisitorRecordStatus {
  return value === 'checked_in' || value === 'checked_out' || value === 'expired'
}

/** 合并历史快照与预约流转结果，并按当前账号限制企业数据范围 */
function getScopedRecords(state: MockState, user: MockUserEntity): VisitorRecordDto[] {
  const appointmentRecords = state.visitorAppointments.flatMap((appointment) => {
    // 未签到且已超时的待到访预约也纳入过期记录，无需访问预约页触发刷新
    const status = appointment.status === 'approved' && dayjs(appointment.scheduledEndAt).isBefore(dayjs())
      ? 'expired'
      : appointment.status
    if (!isVisitorRecordStatus(status)) {
      return []
    }

    const { id, code, visitorName, visitorPhone, hostName, enterpriseId, enterpriseName,
      scheduledStartAt, scheduledEndAt, visitReason, plateNumber, checkedInAt, checkedOutAt } = appointment
    return [{ id, code, visitorName, visitorPhone, hostName, enterpriseId, enterpriseName,
      scheduledStartAt, scheduledEndAt, visitReason, plateNumber, checkedInAt, checkedOutAt, status }]
  })

  return [...seedVisitorRecords, ...appointmentRecords]
    .filter((record) => user.roleCode !== 'enterprise_user' || record.enterpriseId === user.enterpriseId)
    .sort((a, b) => dayjs(b.checkedInAt ?? b.scheduledStartAt).valueOf() - dayjs(a.checkedInAt ?? a.scheduledStartAt).valueOf())
}

/** 校验真实日历日期，防止无效日期被自动滚动到下个月 */
function isValidDate(value: string | null) {
  return !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid() && dayjs(value).format('YYYY-MM-DD') === value)
}

/** 校验分页参数，省略时使用默认值 */
function parsePositiveInteger(value: string | null, fallback: number) {
  if (value === null) return fallback
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
}

/** 计算较昨日变化，昨日无基数时不生成百分比 */
function calculateChange(today: number, yesterday: number) {
  return yesterday === 0 ? null : Math.round((today - yesterday) / yesterday * 100)
}

/** 到访记录只读模拟接口，沿用访客权限和企业数据隔离 */
export const visitorRecordHandlers = [
  http.get('/api/visitor-records/summary', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:view')
    if ('response' in auth) return auth.response

    const records = getScopedRecords(auth.state, auth.user)
    const today = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    const count = (field: 'checkedInAt' | 'checkedOutAt', date: string) => records.filter(
      (record) => record[field] && dayjs(record[field]).format('YYYY-MM-DD') === date,
    ).length
    const todayArrivals = count('checkedInAt', today)
    const todayDepartures = count('checkedOutAt', today)

    return createSuccessResponse<VisitorRecordSummaryDto>({
      todayArrivals,
      todayDepartures,
      arrivalsChangePercent: calculateChange(todayArrivals, count('checkedInAt', yesterday)),
      departuresChangePercent: calculateChange(todayDepartures, count('checkedOutAt', yesterday)),
    })
  }),
  http.get('/api/visitor-records', async ({ request }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:view')
    if ('response' in auth) return auth.response

    const params = new URL(request.url).searchParams
    const page = parsePositiveInteger(params.get('page'), 1)
    const pageSize = parsePositiveInteger(params.get('pageSize'), 20)
    const visitorName = params.get('visitorName')?.trim().toLowerCase()
    const enterpriseId = params.get('enterpriseId')?.trim()
    const startDate = params.get('startDate')
    const endDate = params.get('endDate')
    const status = params.get('status')

    if (!page || !pageSize || pageSize > 100) return createErrorResponse(400, 40070, '分页参数不正确，每页最多查询 100 条')
    if (status && !isVisitorRecordStatus(status)) return createErrorResponse(400, 40071, '到访状态筛选条件不正确')
    if (!isValidDate(startDate) || !isValidDate(endDate) || (startDate && endDate && startDate > endDate)) {
      return createErrorResponse(400, 40072, '请选择有效的到访日期范围')
    }

    const records = getScopedRecords(auth.state, auth.user).filter((record) => {
      // 已到访记录按实际签到日期查询，过期未到访记录按预约日期查询
      const date = dayjs(record.checkedInAt ?? record.scheduledStartAt).format('YYYY-MM-DD')
      return (!visitorName || record.visitorName.toLowerCase().includes(visitorName)) &&
        (!enterpriseId || record.enterpriseId === enterpriseId) &&
        (!status || record.status === status) &&
        (!startDate || date >= startDate) && (!endDate || date <= endDate)
    })
    const start = (page - 1) * pageSize
    return createSuccessResponse({ list: records.slice(start, start + pageSize), total: records.length, page, pageSize })
  }),
  http.get('/api/visitor-records/:id', async ({ request, params }) => {
    await delay(mockResponseDelay)
    const auth = authorizeRequest(request, 'visitor:view')
    if ('response' in auth) return auth.response

    const record = getScopedRecords(auth.state, auth.user).find((item) => item.id === params.id)
    if (!record) return createErrorResponse(404, 40440, '到访记录不存在或无权查看')
    return createSuccessResponse(record)
  }),
]
