import type { PageResult } from './api'

/** 工单服务分类 */
export type WorkOrderType = 'repair' | 'cleaning' | 'complaint' | 'other'

/** 工单紧急程度 */
export type WorkOrderPriority = 'high' | 'medium' | 'low'

/** 工单生命周期，取消后可由管理员重新打开 */
export type WorkOrderStatus =
  | 'pending_acceptance'
  | 'pending_processing'
  | 'processing'
  | 'pending_confirmation'
  | 'completed'
  | 'cancelled'

/** 可执行的工单流程动作 */
export type WorkOrderAction = 'accept' | 'assign' | 'start' | 'submit' | 'confirm' | 'cancel' | 'reopen'

/** 工单创建资料，编号、状态和提交人由服务端生成 */
export interface WorkOrderCreateRequest {
  /** 问题简述，最多 60 字 */
  title: string
  /** 工单服务分类 */
  type: WorkOrderType
  /** 问题详情，最多 1000 字 */
  description: string
  /** 工单所属企业唯一标识 */
  enterpriseId: string
  /** 负责确认处理结果的企业联系人姓名 */
  contactName: string
  /** 企业联系人的 11 位手机号 */
  contactPhone: string
  /** 问题发生的楼栋、楼层或具体位置 */
  location: string
  /** 处理优先级 */
  priority: WorkOrderPriority
  /** 图片占位名称，仅用于演示附件，不包含实际上传文件 */
  imageNames: string[]
}

/** 工单处理历史，用于展示流程及还原历史状态 */
export interface WorkOrderHistoryDto {
  /** 历史记录唯一标识 */
  id: string
  /** 本次操作名称 */
  action: 'create' | WorkOrderAction
  /** 执行操作的用户姓名快照 */
  operatorName: string
  /** 操作时间，ISO 8601 格式 */
  occurredAt: string
  /** 操作说明及分派信息 */
  remark: string
  /** 本次操作后的状态 */
  status: WorkOrderStatus
}

/** 列表和详情共用的工单数据 */
export interface WorkOrderDto extends WorkOrderCreateRequest {
  /** 工单稳定唯一标识 */
  id: string
  /** 系统生成的唯一业务编号 */
  code: string
  /** 所属企业名称快照 */
  enterpriseName: string
  /** 当前工单状态 */
  status: WorkOrderStatus
  /** 处理人账号标识，尚未分派时为 null */
  assigneeId: string | null
  /** 处理人姓名快照，尚未分派时为 null */
  assigneeName: string | null
  /** 提交人姓名快照 */
  creatorName: string
  /** 提交时间，ISO 8601 格式 */
  createdAt: string
  /** 最近一次操作时间，ISO 8601 格式 */
  updatedAt: string
  /** 企业评价分数，未评价时为 null，范围为 1～5 */
  rating: number | null
  /** 企业确认时的文字反馈 */
  feedback: string
  /** 按时间顺序保存的完整处理记录 */
  history: WorkOrderHistoryDto[]
}

/** 工单中心的分页与筛选条件 */
export interface WorkOrderListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数，最多 100 */
  pageSize?: number
  /** 工单编号关键词，忽略大小写 */
  code?: string
  /** 服务分类，未传时查询全部 */
  type?: WorkOrderType
  /** 所属企业标识，企业账号仍受本企业范围限制 */
  enterpriseId?: string
  /** 生命周期状态，未传时查询全部 */
  status?: WorkOrderStatus
}

/** 工单分页查询结果 */
export type WorkOrderPageResult = PageResult<WorkOrderDto>

/** 工单状态统计，比较值按一周前的处理记录还原 */
export interface WorkOrderMetricDto {
  /** 统计对应的状态 */
  status: WorkOrderStatus
  /** 当前账号可见范围内的工单数 */
  count: number
  /** 相比一周前该状态数量的增减值 */
  change: number
}

/** 创建、筛选和分派表单的可选业务数据 */
export interface WorkOrderOptionsDto {
  /** 当前账号可见的全部企业，不受列表分页限制 */
  enterprises: {
    /** 企业稳定标识 */
    id: string
    /** 企业显示名称 */
    name: string
    /** 默认企业联系人 */
    contactName: string
    /** 默认企业联系人手机号 */
    contactPhone: string
  }[]
  /** 可分派的在用运营或管理员账号 */
  assignees: {
    /** 处理人账号标识 */
    id: string
    /** 处理人显示姓名 */
    name: string
  }[]
}

/** 工单动作请求，各动作在服务端校验状态和角色权限 */
export interface WorkOrderActionRequest {
  /** 需要执行的动作 */
  action: WorkOrderAction
  /** 操作时看到的状态，用于阻止过期操作 */
  expectedStatus: WorkOrderStatus
  /** 受理或分派时必填的处理人账号标识 */
  assigneeId?: string
  /** 提交结果、取消和重新打开时必填的说明 */
  remark?: string
  /** 确认时可选的 1～5 分评价 */
  rating?: number
}
