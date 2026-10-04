import type { PageResult } from '@/types/api'

/** 操作发生的业务模块，用于审计分类和列表筛选 */
export type OperationLogModule =
  'park' | 'enterprise' | 'personnel' | 'visitor' | 'parking' | 'work_order' | 'device' | 'system'

/** 操作执行结果，失败记录在详情中提供原因 */
export type OperationLogResult = 'success' | 'failure'

/** 操作日志列表中的历史审计快照，不随用户或业务对象后续变更而更新 */
export interface OperationLogDto {
  /** 日志唯一标识，用于读取详情 */
  id: string
  /** 操作发生时间，使用带时区的 ISO 8601 格式 */
  operatedAt: string
  /** 操作发生时的人员姓名 */
  operatorName: string
  /** 操作发生时的角色名称 */
  roleName: string
  /** 操作所属业务模块 */
  module: OperationLogModule
  /** 操作动作，如新增、修改、删除或登录 */
  action: string
  /** 操作对象的可读名称，登录等无业务对象的操作为空 */
  objectName: string | null
  /** 发起操作的客户端 IP 地址 */
  ipAddress: string
  /** 本次操作是否执行成功 */
  result: OperationLogResult
}

/** 日志详情，补充原始请求信息及失败诊断 */
export interface OperationLogDetailDto extends OperationLogDto {
  /** 业务对象标识，无具体业务对象时为空 */
  objectId: string | null
  /** 请求使用的 HTTP 方法 */
  requestMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** 请求的接口路径，不包含域名 */
  requestUrl: string
  /** 本次操作的业务描述 */
  description: string
  /** 脱敏后的请求参数，无参数时为空 */
  requestParams: Record<string, unknown> | null
  /** 失败原因，仅失败记录具有该信息 */
  failureReason: string | null
}

/** 操作日志查询条件，各筛选项同时生效 */
export interface OperationLogListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数，最多 100 条 */
  pageSize?: number
  /** 操作人姓名关键词，忽略首尾空格 */
  operatorName?: string
  /** 操作所属业务模块 */
  module?: OperationLogModule
  /** 操作执行结果 */
  result?: OperationLogResult
  /** 查询起始时间，ISO 8601 UTC 格式，包含边界 */
  startTime?: string
  /** 查询结束时间，ISO 8601 UTC 格式，包含边界 */
  endTime?: string
}

/** 按操作时间倒序返回的分页日志 */
export type OperationLogPageResult = PageResult<OperationLogDto>
