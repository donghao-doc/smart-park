import type { RequestHandler } from 'msw'
import { authHandlers } from './handlers/auth'
import { dashboardHandlers } from './handlers/dashboard'
import { enterpriseHandlers } from './handlers/enterprises'
import { parkProfileHandlers } from './handlers/park-profile'
import { personnelHandlers } from './handlers/personnel'
import { systemUserHandlers } from './handlers/system-users'
import { visitorAppointmentHandlers } from './handlers/visitor-appointments'
import { visitorRecordHandlers } from './handlers/visitor-records'
import { vehicleHandlers } from './handlers/vehicles'

/**
 * 项目接口模拟处理器集合
 */
export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...enterpriseHandlers,
  ...personnelHandlers,
  ...parkProfileHandlers,
  ...systemUserHandlers,
  ...visitorAppointmentHandlers,
  ...visitorRecordHandlers,
  ...vehicleHandlers,
] satisfies RequestHandler[]
