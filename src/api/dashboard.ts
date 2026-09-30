import type {
  DashboardSummaryDto,
  DashboardTaskDto,
  DashboardTrendParams,
  DeviceStatusDto,
  VisitorTrendPointDto,
  WorkOrderTrendPointDto,
} from '../types/dashboard'
import http from '../http'

/**
 * 查询 Dashboard 核心指标和最后更新时间
 */
export async function reqGetDashboardSummary() {
  return http.get<DashboardSummaryDto>('/dashboard/summary')
}

/**
 * 查询指定时间范围内的访客趋势
 */
export async function reqGetVisitorTrend(params: DashboardTrendParams) {
  return http.get<VisitorTrendPointDto[]>('/dashboard/visitor-trend', { params })
}

/**
 * 查询指定时间范围内的工单趋势
 */
export async function reqGetWorkOrderTrend(params: DashboardTrendParams) {
  return http.get<WorkOrderTrendPointDto[]>('/dashboard/work-order-trend', { params })
}

/**
 * 查询 Dashboard 今日待办
 */
export async function reqGetDashboardTasks() {
  return http.get<DashboardTaskDto[]>('/dashboard/tasks')
}

/**
 * 查询 Dashboard 设备状态分布
 */
export async function reqGetDeviceStatuses() {
  return http.get<DeviceStatusDto[]>('/dashboard/device-statuses')
}
