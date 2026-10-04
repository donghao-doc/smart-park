import type { PageResult } from './api'

/**
 * 访客预约状态
 */
export type VisitorAppointmentStatus =
  'pending' | 'approved' | 'checked_in' | 'checked_out' | 'rejected' | 'cancelled' | 'expired'

/**
 * 访客预约列表与详情共用的数据结构
 */
export interface VisitorAppointmentDto {
  /** 预约稳定唯一标识 */
  id: string
  /** 对外展示的预约编号 */
  code: string
  /** 访客姓名 */
  visitorName: string
  /** 访客手机号码 */
  visitorPhone: string
  /** 受访人员稳定唯一标识 */
  hostId: string
  /** 受访人员姓名快照 */
  hostName: string
  /** 所属企业稳定唯一标识 */
  enterpriseId: string
  /** 所属企业名称快照 */
  enterpriseName: string
  /** 预约开始时间，ISO 8601 格式 */
  scheduledStartAt: string
  /** 预约结束时间，ISO 8601 格式 */
  scheduledEndAt: string
  /** 访问事由 */
  visitReason: string
  /** 访客车牌号，未驾车时为空 */
  plateNumber: string | null
  /** 当前流程状态 */
  status: VisitorAppointmentStatus
  /** 驳回或取消原因 */
  terminationReason: string | null
  /** 实际签到时间，ISO 8601 格式 */
  checkedInAt: string | null
  /** 实际签出时间，ISO 8601 格式 */
  checkedOutAt: string | null
  /** 创建预约的用户标识 */
  createdBy: string
  /** 数据创建时间，ISO 8601 格式 */
  createdAt: string
  /** 数据最后更新时间，ISO 8601 格式 */
  updatedAt: string
}

/**
 * 访客预约列表查询参数
 */
export interface VisitorAppointmentListParams {
  /** 当前页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 访客姓名关键词 */
  visitorName?: string
  /** 所属企业稳定唯一标识 */
  enterpriseId?: string
  /** 预约日期范围起始日期，YYYY-MM-DD 格式 */
  startDate?: string
  /** 预约日期范围结束日期，YYYY-MM-DD 格式 */
  endDate?: string
  /** 预约状态筛选 */
  status?: VisitorAppointmentStatus
}

/**
 * 访客预约分页列表响应数据
 */
export type VisitorAppointmentPageResult = PageResult<VisitorAppointmentDto>

/**
 * 创建访客预约时提交的数据
 */
export interface CreateVisitorAppointmentRequest {
  /** 访客姓名 */
  visitorName: string
  /** 访客手机号码 */
  visitorPhone: string
  /** 受访人员稳定唯一标识 */
  hostId: string
  /** 所属企业稳定唯一标识 */
  enterpriseId: string
  /** 预约开始时间，ISO 8601 格式 */
  scheduledStartAt: string
  /** 预约结束时间，ISO 8601 格式 */
  scheduledEndAt: string
  /** 访问事由 */
  visitReason: string
  /** 访客车牌号，未驾车时不传 */
  plateNumber?: string
}

/**
 * 访客预约可执行的流程动作
 */
export type VisitorAppointmentAction = 'approve' | 'reject' | 'check_in' | 'check_out' | 'cancel'

/**
 * 更新访客预约流程状态时提交的数据
 */
export interface UpdateVisitorAppointmentStatusRequest {
  /** 本次执行的流程动作 */
  action: VisitorAppointmentAction
  /** 驳回或取消时必填的原因 */
  reason?: string
}

/**
 * 访客预约页面顶部状态统计
 */
export interface VisitorAppointmentSummaryDto {
  /** 待审批预约数量 */
  pending: number
  /** 待到访预约数量 */
  approved: number
  /** 已到访预约数量 */
  checkedIn: number
  /** 已离园预约数量 */
  checkedOut: number
  /** 待审批数量相对上周变化 */
  pendingDelta: number
  /** 待到访数量相对上周变化 */
  approvedDelta: number
  /** 已到访数量相对上周变化 */
  checkedInDelta: number
  /** 已离园数量相对上周变化 */
  checkedOutDelta: number
}
