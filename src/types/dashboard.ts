/**
 * Dashboard 趋势查询范围
 */
export type DashboardTrendRange = '7d' | '30d' | 'custom'

/**
 * Dashboard 指标业务类型
 */
export type DashboardMetricKey =
  'enterprise' | 'personnel' | 'visitor' | 'vehicle' | 'workOrder' | 'device'

/**
 * 指标变化方向，用于选择趋势颜色和箭头
 */
export type DashboardTrendDirection = 'up' | 'down'

/**
 * Dashboard 顶部核心指标
 */
export interface DashboardMetricDto {
  /** 指标业务类型，用于匹配图标和跳转目标 */
  key: DashboardMetricKey
  /** 指标显示名称 */
  title: string
  /** 当前统计值 */
  value: number
  /** 数值单位 */
  unit: string
  /** 相较基准的变化文案 */
  change: string
  /** 变化方向 */
  direction: DashboardTrendDirection
  /** 对比基准说明 */
  comparison: string
}

/**
 * Dashboard 核心指标汇总
 */
export interface DashboardSummaryDto {
  /** 顶部核心指标集合 */
  metrics: DashboardMetricDto[]
}

/**
 * Dashboard 趋势查询参数
 */
export interface DashboardTrendParams {
  /** 预设或自定义时间范围 */
  range: DashboardTrendRange
  /** 自定义范围开始日期，格式为 YYYY-MM-DD */
  startDate?: string
  /** 自定义范围结束日期，格式为 YYYY-MM-DD */
  endDate?: string
}

/**
 * 访客趋势单日数据
 */
export interface VisitorTrendPointDto {
  /** 日期，格式为 YYYY-MM-DD */
  date: string
  /** 当日访客人数 */
  value: number
}

/**
 * 工单趋势单日数据
 */
export interface WorkOrderTrendPointDto {
  /** 日期，格式为 YYYY-MM-DD */
  date: string
  /** 当日新增工单数 */
  created: number
  /** 当日完成工单数 */
  completed: number
}

/**
 * 今日待办优先级
 */
export type DashboardTaskPriority = 'high' | 'medium' | 'low'

/**
 * Dashboard 今日待办任务
 */
export interface DashboardTaskDto {
  /** 待办稳定唯一标识 */
  id: string
  /** 待办标题 */
  title: string
  /** 业务类型名称 */
  category: string
  /** 待办优先级 */
  priority: DashboardTaskPriority
  /** 创建时间，ISO 8601 格式 */
  createdAt: string
  /** 处理页面地址 */
  actionPath: string
}

/**
 * 设备状态业务编码
 */
export type DeviceStatusKey = 'online' | 'offline' | 'warning' | 'maintenance'

/**
 * Dashboard 设备状态统计项
 */
export interface DeviceStatusDto {
  /** 设备状态编码 */
  key: DeviceStatusKey
  /** 状态显示名称 */
  label: string
  /** 对应设备数量 */
  value: number
  /** 在全部设备中的占比，取值范围为 0～100 */
  percentage: number
}
