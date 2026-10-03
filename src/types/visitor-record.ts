import type { PageResult } from './api'

/** 到访记录可查询的历史状态 */
export type VisitorRecordStatus = 'checked_in' | 'checked_out' | 'expired'

/** 到访列表与只读详情使用的记录快照 */
export interface VisitorRecordDto {
  /** 记录唯一标识，预约流转产生的记录沿用预约标识 */
  id: string
  /** 对应的预约编号 */
  code: string
  /** 访客姓名 */
  visitorName: string
  /** 完整手机号码，列表展示时脱敏 */
  visitorPhone: string
  /** 受访人员姓名快照 */
  hostName: string
  /** 所属企业唯一标识，用于筛选和数据隔离 */
  enterpriseId: string
  /** 所属企业名称快照 */
  enterpriseName: string
  /** 预约开始时间，ISO 8601 格式 */
  scheduledStartAt: string
  /** 预约结束时间，ISO 8601 格式 */
  scheduledEndAt: string
  /** 来访事由 */
  visitReason: string
  /** 访客车牌号，未驾车时为空 */
  plateNumber: string | null
  /** 当前到访状态 */
  status: VisitorRecordStatus
  /** 实际签到时间，ISO 8601 格式，过期未到访时为空 */
  checkedInAt: string | null
  /** 实际签出时间，ISO 8601 格式，尚未离园时为空 */
  checkedOutAt: string | null
}

/** 到访记录分页和筛选参数 */
export interface VisitorRecordListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页记录数量，最多 100 条 */
  pageSize?: number
  /** 访客姓名关键词 */
  visitorName?: string
  /** 所属企业唯一标识 */
  enterpriseId?: string
  /** 签到日期下限，YYYY-MM-DD 格式，过期记录使用预约日期 */
  startDate?: string
  /** 签到日期上限，YYYY-MM-DD 格式，过期记录使用预约日期 */
  endDate?: string
  /** 到访状态筛选 */
  status?: VisitorRecordStatus
}

/** 到访记录分页响应 */
export type VisitorRecordPageResult = PageResult<VisitorRecordDto>

/** 当前账号数据范围内的今日到访与离园统计，不受列表筛选影响 */
export interface VisitorRecordSummaryDto {
  /** 今日签到人数，包含今日已离园的访客 */
  todayArrivals: number
  /** 今日签出人数，包含此前日期签到的访客 */
  todayDepartures: number
  /** 到访人数较昨日变化百分比，昨日为零时为空 */
  arrivalsChangePercent: number | null
  /** 离园人数较昨日变化百分比，昨日为零时为空 */
  departuresChangePercent: number | null
}
