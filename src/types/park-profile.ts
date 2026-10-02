/**
 * 园区基础信息
 */
export interface ParkInfoDto {
  /** 园区稳定唯一标识 */
  id: string
  /** 园区名称 */
  name: string
  /** 园区地址 */
  address: string
  /** 园区联系人姓名 */
  contactName: string
  /** 园区联系电话 */
  contactPhone: string
  /** 园区占地面积，单位为平方米 */
  area: number
  /** 园区简介 */
  description: string
}

/**
 * 园区基础信息编辑参数
 */
export interface UpdateParkInfoRequest {
  /** 园区名称 */
  name: string
  /** 园区地址 */
  address: string
  /** 园区联系人姓名 */
  contactName: string
  /** 园区联系电话 */
  contactPhone: string
  /** 园区占地面积，单位为平方米 */
  area: number
  /** 园区简介 */
  description: string
}

/**
 * 园区楼宇空间汇总指标
 */
export interface ParkSpaceSummaryDto {
  /** 楼宇数量 */
  buildingCount: number
  /** 楼层数量 */
  floorCount: number
  /** 办公空间数量 */
  spaceCount: number
  /** 已使用空间数量 */
  usedSpaceCount: number
}

/**
 * 楼层树节点
 */
export interface ParkFloorDto {
  /** 楼层稳定唯一标识 */
  id: string
  /** 楼层显示名称 */
  name: string
}

/**
 * 楼宇树节点
 */
export interface ParkBuildingDto {
  /** 楼宇稳定唯一标识 */
  id: string
  /** 楼宇显示名称 */
  name: string
  /** 楼宇用途说明 */
  description: string
  /** 楼宇下的楼层列表 */
  floors: ParkFloorDto[]
}

/**
 * 园区档案页面汇总数据
 */
export interface ParkProfileDto {
  /** 园区基础信息 */
  info: ParkInfoDto
  /** 园区空间汇总指标 */
  summary: ParkSpaceSummaryDto
  /** 园区楼宇树 */
  buildings: ParkBuildingDto[]
}

/**
 * 空间使用状态
 */
export type ParkSpaceStatus = 'used' | 'vacant'

/**
 * 园区空间明细
 */
export interface ParkSpaceDto {
  /** 空间稳定唯一标识 */
  id: string
  /** 空间编号 */
  name: string
  /** 所属楼宇标识 */
  buildingId: string
  /** 所属楼宇名称 */
  buildingName: string
  /** 所属楼层标识 */
  floorId: string
  /** 所属楼层名称 */
  floorName: string
  /** 空间用途类型 */
  type: string
  /** 空间面积，单位为平方米 */
  area: number
  /** 空间当前使用状态 */
  status: ParkSpaceStatus
}

/**
 * 空间列表查询参数
 */
export interface ParkSpaceListParams {
  /** 页码，从 1 开始 */
  page: number
  /** 每页数据量 */
  pageSize: number
  /** 按楼宇或楼层标识筛选 */
  locationId?: string
  /** 按使用状态筛选 */
  status?: ParkSpaceStatus
  /** 按空间编号或楼宇名称搜索 */
  keyword?: string
}

/**
 * 空间分页列表
 */
export interface ParkSpaceListDto {
  /** 当前页空间数据 */
  items: ParkSpaceDto[]
  /** 符合条件的空间总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数据量 */
  pageSize: number
}
