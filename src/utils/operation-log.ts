import type { OperationLogModule, OperationLogResult } from '@/types/operation-log'

/** 操作日志业务模块的中文展示名称 */
export const operationLogModuleLabels: Record<OperationLogModule, string> = {
  park: '园区档案',
  enterprise: '企业管理',
  personnel: '人员管理',
  visitor: '访客管理',
  parking: '停车管理',
  work_order: '工单中心',
  device: '设备管理',
  system: '系统管理',
}

/** 操作执行结果的中文展示名称 */
export const operationLogResultLabels: Record<OperationLogResult, string> = {
  success: '成功',
  failure: '失败',
}
