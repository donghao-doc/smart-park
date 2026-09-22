import type { RequestHandler } from 'msw'
import { authHandlers } from './handlers/auth'
import { systemUserHandlers } from './handlers/system-users'

/**
 * 项目接口模拟处理器集合
 */
export const handlers = [...authHandlers, ...systemUserHandlers] satisfies RequestHandler[]
