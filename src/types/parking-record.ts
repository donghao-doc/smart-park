import type { PageResult } from './api'

/** 停车通行记录中的车型，与车辆档案的员工车、访客车业务分类独立 */
export type ParkingVehicleType = 'small' | 'large' | 'temporary'

/** 停车状态，无权限表示入口拦截且未实际入场 */
export type ParkingRecordStatus = 'parked' | 'departed' | 'overtime' | 'unauthorized'

/** 停车列表和详情共用的通行记录快照 */
export interface ParkingRecordDto {
  /** 通行记录唯一标识 */
  id: string
  /** 已归一化的车牌号 */
  plateNumber: string
  /** 通行识别的车型 */
  vehicleType: ParkingVehicleType
  /** 记录归属企业标识，用于企业账号的数据隔离 */
  enterpriseId: string
  /** 通行发生时的企业名称快照 */
  enterpriseName: string
  /** 入场或拦截发生的入口 */
  entrance: string
  /** 入场时间，无权限记录为入口识别时间，ISO 8601 格式 */
  enteredAt: string
  /** 离场出口，未离场或被拦截时为空 */
  exit: string | null
  /** 出场时间，未离场或被拦截时为空，ISO 8601 格式 */
  exitedAt: string | null
  /** 通行状态，超时阈值为连续停车 24 小时 */
  status: ParkingRecordStatus
}

/** 停车记录分页和筛选参数 */
export interface ParkingRecordListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页记录数，最多 100 条 */
  pageSize?: number
  /** 车牌关键词，忽略大小写和分隔符 */
  plateNumber?: string
  /** 通行识别的车型 */
  vehicleType?: ParkingVehicleType
  /** 入场时间下限，ISO 8601 格式，无权限记录按识别时间筛选 */
  startTime?: string
  /** 入场时间上限，ISO 8601 格式，包含边界 */
  endTime?: string
  /** 通行状态 */
  status?: ParkingRecordStatus
}

/** 停车记录分页响应 */
export type ParkingRecordPageResult = PageResult<ParkingRecordDto>

/** 当前账号可见范围的停车统计，不受列表筛选影响 */
export interface ParkingRecordSummaryDto {
  /** 当前已入场且未离场的车辆数，包含超时车辆 */
  currentParked: number
  /** 当前在场车辆数与一周前同一时刻的差值 */
  parkedChange: number
  /** 今日实际入场数，不含无权限拦截 */
  todayEntries: number
  /** 今日实际离场数 */
  todayExits: number
  /** 当前超时车辆与今日无权限拦截的合计数 */
  abnormalVehicles: number
  /** 今日入场数较昨日变化百分比，昨日为零时为空 */
  entriesChangePercent: number | null
  /** 今日出场数较昨日变化百分比，昨日为零时为空 */
  exitsChangePercent: number | null
  /** 异常车辆较昨日同一时刻变化百分比，昨日为零时为空 */
  abnormalChangePercent: number | null
}
