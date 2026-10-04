import type { PageResult } from './api'

/** 园区设备所属的业务分类 */
export type DeviceType =
  'camera' | 'access' | 'parking' | 'environment' | 'broadcast' | 'fire' | 'energy'

/** 设备当前运行状态，停用表示主动停止使用 */
export type DeviceStatus = 'normal' | 'fault' | 'offline' | 'disabled'

/** 新增或编辑设备时提交的档案 */
export interface DeviceMutationRequest {
  /** 园区内唯一的设备编码，保存时去除首尾空格并转为大写 */
  code: string
  /** 设备的业务名称 */
  name: string
  /** 设备所属业务类型 */
  type: DeviceType
  /** 安装位置，允许登记新的园区位置 */
  location: string
  /** 负责设备的人员姓名 */
  ownerName: string
  /** 当前运行状态，编辑状态需具备独立状态权限 */
  status: DeviceStatus
}

/** 设备列表共用的档案信息 */
export interface DeviceDto extends DeviceMutationRequest {
  /** 稳定唯一标识，不随设备编码修改而变化 */
  id: string
  /** 档案创建时间，ISO 8601 格式 */
  createdAt: string
  /** 最近一次档案或状态更新时间，ISO 8601 格式 */
  updatedAt: string
}

/** 可追溯的设备状态变化记录 */
export interface DeviceStatusRecord {
  /** 记录唯一标识 */
  id: string
  /** 变化前的状态，首次登记时为 null */
  previousStatus: DeviceStatus | null
  /** 变化后的状态 */
  status: DeviceStatus
  /** 操作人姓名或模拟系统名称 */
  operatorName: string
  /** 变化发生时间，ISO 8601 格式 */
  changedAt: string
}

/** 设备详情，包括基本档案和按时间倒序排列的最近状态记录 */
export interface DeviceDetailDto extends DeviceDto {
  /** 最近状态记录，最多保留 20 条 */
  statusRecords: DeviceStatusRecord[]
}

/** 设备分页与组合筛选参数 */
export interface DeviceListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数，不超过 100 */
  pageSize?: number
  /** 设备名称或编码关键词，忽略大小写 */
  keyword?: string
  /** 所属业务类型 */
  type?: DeviceType
  /** 精确匹配的安装位置 */
  location?: string
  /** 当前运行状态 */
  status?: DeviceStatus
}

/** 设备档案分页响应 */
export type DevicePageResult = PageResult<DeviceDto>

/** 全园区设备统计，独立于列表筛选条件 */
export interface DeviceSummaryDto {
  /** 已登记的设备总数，包含停用设备 */
  total: number
  /** 按运行状态统计的设备数量，合计等于总数 */
  counts: Record<DeviceStatus, number>
}
