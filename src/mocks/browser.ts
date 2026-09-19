import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * 浏览器端接口模拟 Worker
 */
export const worker = setupWorker(...handlers)
