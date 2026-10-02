import type { RequestHandler } from 'msw'
import { authHandlers } from './handlers/auth'
import { dashboardHandlers } from './handlers/dashboard'
import { parkProfileHandlers } from './handlers/park-profile'
import { systemUserHandlers } from './handlers/system-users'

/**
 * 项目接口模拟处理器集合
 */
export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...parkProfileHandlers,
  ...systemUserHandlers,
] satisfies RequestHandler[]
