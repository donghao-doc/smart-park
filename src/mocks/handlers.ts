import type { RequestHandler } from 'msw'
import { authHandlers } from './handlers/auth'
import { dashboardHandlers } from './handlers/dashboard'
import { enterpriseHandlers } from './handlers/enterprises'
import { parkProfileHandlers } from './handlers/park-profile'
import { personnelHandlers } from './handlers/personnel'
import { systemUserHandlers } from './handlers/system-users'
import { systemRoleHandlers } from './handlers/system-roles'
import { visitorAppointmentHandlers } from './handlers/visitor-appointments'
import { visitorRecordHandlers } from './handlers/visitor-records'
import { vehicleHandlers } from './handlers/vehicles'
import { parkingRecordHandlers } from './handlers/parking-records'
import { workOrderHandlers } from './handlers/work-orders'
import { deviceHandlers } from './handlers/devices'
import { operationLogHandlers } from './handlers/operation-logs'
import { mockDataHandlers } from './handlers/mock-data'
import { simulationHandlers } from './handlers/simulation'

/**
 * 项目接口模拟处理器集合
 */
export const handlers = [
  // 管理接口先于异常拦截执行，避免模拟失败后无法关闭设置
  ...mockDataHandlers,
  ...simulationHandlers,
  ...authHandlers,
  ...dashboardHandlers,
  ...enterpriseHandlers,
  ...personnelHandlers,
  ...parkProfileHandlers,
  ...systemRoleHandlers,
  ...systemUserHandlers,
  ...visitorAppointmentHandlers,
  ...visitorRecordHandlers,
  ...vehicleHandlers,
  ...parkingRecordHandlers,
  ...workOrderHandlers,
  ...deviceHandlers,
  ...operationLogHandlers,
] satisfies RequestHandler[]
