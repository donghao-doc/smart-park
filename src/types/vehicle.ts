import type { PageResult } from './api'

/** 园区备案车辆的业务类型 */
export type VehicleType = 'employee' | 'visitor'

/** 车辆档案的启停状态 */
export type VehicleStatus = 'active' | 'disabled'

/** 新增或编辑车辆时提交的档案信息 */
export interface VehicleMutationRequest {
  /** 车牌号，保存时统一移除分隔符并转为大写 */
  plateNumber: string
  /** 员工车或访客车 */
  type: VehicleType
  /** 车辆登记的车主姓名 */
  ownerName: string
  /** 所属园区企业的稳定标识 */
  enterpriseId: string
  /** 联系车主的 11 位手机号码 */
  phone: string
  /** 档案状态，编辑时修改该字段需具备启停权限 */
  status: VehicleStatus
}

/** 车辆列表和详情共用的档案数据 */
export interface VehicleDto extends VehicleMutationRequest {
  /** 车辆档案的稳定唯一标识 */
  id: string
  /** 接口返回的所属企业名称 */
  enterpriseName: string
  /** 档案创建时间，ISO 8601 格式 */
  createdAt: string
  /** 档案最后更新时间，ISO 8601 格式 */
  updatedAt: string
}

/** 车辆列表的分页与筛选参数 */
export interface VehicleListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 车牌关键词，忽略大小写及分隔符 */
  plateNumber?: string
  /** 车辆业务类型 */
  type?: VehicleType
  /** 所属企业标识 */
  enterpriseId?: string
  /** 档案启停状态 */
  status?: VehicleStatus
}

/** 车辆档案分页响应 */
export type VehiclePageResult = PageResult<VehicleDto>

/** 车辆筛选和登记可选择的企业摘要 */
export interface VehicleEnterpriseOption {
  /** 企业的稳定唯一标识 */
  id: string
  /** 企业完整名称 */
  name: string
}

/** 车辆启停操作提交的数据 */
export interface UpdateVehicleStatusRequest {
  /** 目标档案状态 */
  status: VehicleStatus
}
