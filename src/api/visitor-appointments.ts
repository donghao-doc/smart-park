import http from '@/http'
import type {
  CreateVisitorAppointmentRequest,
  UpdateVisitorAppointmentStatusRequest,
  VisitorAppointmentDto,
  VisitorAppointmentListParams,
  VisitorAppointmentPageResult,
  VisitorAppointmentSummaryDto,
} from '@/types/visitor-appointment'

/**
 * 分页查询访客预约列表
 */
export async function reqGetVisitorAppointments(params: VisitorAppointmentListParams = {}) {
  return http.get<VisitorAppointmentPageResult>('/visitor-appointments', { params })
}

/**
 * 查询访客预约状态统计
 */
export async function reqGetVisitorAppointmentSummary() {
  return http.get<VisitorAppointmentSummaryDto>('/visitor-appointments/summary')
}

/**
 * 创建访客预约
 */
export async function reqCreateVisitorAppointment(payload: CreateVisitorAppointmentRequest) {
  return http.post<VisitorAppointmentDto, CreateVisitorAppointmentRequest>(
    '/visitor-appointments',
    payload,
  )
}

/**
 * 推进或终止指定访客预约流程
 */
export async function reqUpdateVisitorAppointmentStatus(
  appointmentId: string,
  payload: UpdateVisitorAppointmentStatusRequest,
) {
  return http.patch<VisitorAppointmentDto, UpdateVisitorAppointmentStatusRequest>(
    `/visitor-appointments/${appointmentId}/status`,
    payload,
  )
}
