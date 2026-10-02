import type { PageResult } from './api'

/**
 * 企业入驻状态
 */
export type EnterpriseStatus = 'active' | 'disabled'

/**
 * 企业联系人信息
 */
export interface EnterpriseContactDto {
  /** 联系人姓名 */
  name: string
  /** 联系人职务 */
  title: string
  /** 手机号码 */
  phone: string
  /** 座机号码 */
  telephone: string
  /** 工作邮箱 */
  email: string
  /** 联系地址 */
  address: string
}

/**
 * 企业办公位置信息
 */
export interface EnterpriseOfficeDto {
  /** 所属园区名称 */
  parkName: string
  /** 楼宇名称 */
  buildingName: string
  /** 楼层名称 */
  floorName: string
  /** 办公区域编号 */
  roomName: string
  /** 完整办公地址 */
  address: string
}

/**
 * 企业关键业务指标
 */
export interface EnterpriseMetricsDto {
  /** 当前企业成员数量 */
  memberCount: number
  /** 已备案车辆数量 */
  vehicleCount: number
  /** 企业关联工单数量 */
  workOrderCount: number
  /** 已入驻时长展示文本 */
  tenancyDuration: string
}

/**
 * 企业最近动态
 */
export interface EnterpriseActivityDto {
  /** 动态稳定唯一标识 */
  id: string
  /** 动态发生时间，ISO 8601 格式 */
  occurredAt: string
  /** 动态内容 */
  content: string
}

/**
 * 企业成员摘要
 */
export interface EnterpriseMemberDto {
  /** 成员稳定唯一标识 */
  id: string
  /** 成员姓名 */
  name: string
  /** 所属部门 */
  department: string
  /** 职务 */
  title: string
  /** 手机号码 */
  phone: string
  /** 在职状态 */
  status: 'active' | 'inactive'
}

/**
 * 企业备案车辆摘要
 */
export interface EnterpriseVehicleDto {
  /** 车辆稳定唯一标识 */
  id: string
  /** 车牌号码 */
  plateNumber: string
  /** 车辆类型 */
  type: string
  /** 车主姓名 */
  ownerName: string
  /** 备案状态 */
  status: 'active' | 'disabled'
}

/**
 * 企业关联工单摘要
 */
export interface EnterpriseWorkOrderDto {
  /** 工单稳定唯一标识 */
  id: string
  /** 工单编号 */
  code: string
  /** 工单标题 */
  title: string
  /** 工单状态 */
  status: 'processing' | 'pending' | 'completed'
  /** 创建时间，ISO 8601 格式 */
  createdAt: string
}

/**
 * 企业列表项
 */
export interface EnterpriseListItemDto {
  /** 企业稳定唯一标识 */
  id: string
  /** 企业名称 */
  name: string
  /** 统一社会信用代码 */
  creditCode: string
  /** 所属行业 */
  industry: string
  /** 主要联系人姓名 */
  contactName: string
  /** 联系人手机号码 */
  contactPhone: string
  /** 办公位置简写 */
  officeLocation: string
  /** 企业入驻状态 */
  status: EnterpriseStatus
}

/**
 * 企业详情
 */
export interface EnterpriseDetailDto extends EnterpriseListItemDto {
  /** 企业类型 */
  companyType: string
  /** 注册资本展示文本 */
  registeredCapital: string
  /** 成立日期，YYYY-MM-DD 格式 */
  foundedAt: string
  /** 经营范围 */
  businessScope: string
  /** 企业简介 */
  description: string
  /** 企业联系人信息 */
  contact: EnterpriseContactDto
  /** 企业办公位置信息 */
  office: EnterpriseOfficeDto
  /** 企业关键业务指标 */
  metrics: EnterpriseMetricsDto
  /** 企业最近动态 */
  activities: EnterpriseActivityDto[]
  /** 企业成员摘要列表 */
  members: EnterpriseMemberDto[]
  /** 企业备案车辆摘要列表 */
  vehicles: EnterpriseVehicleDto[]
  /** 企业关联工单摘要列表 */
  workOrders: EnterpriseWorkOrderDto[]
}

/**
 * 企业列表查询参数
 */
export interface EnterpriseListParams {
  /** 当前页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 匹配企业名称的关键词 */
  keyword?: string
  /** 企业入驻状态筛选 */
  status?: EnterpriseStatus
}

/**
 * 企业分页列表响应数据
 */
export type EnterprisePageResult = PageResult<EnterpriseListItemDto>

/**
 * 创建或编辑企业时提交的数据
 */
export interface EnterpriseMutationRequest {
  /** 企业名称 */
  name: string
  /** 统一社会信用代码 */
  creditCode: string
  /** 所属行业 */
  industry: string
  /** 企业类型 */
  companyType: string
  /** 主要联系人姓名 */
  contactName: string
  /** 联系人手机号码 */
  contactPhone: string
  /** 办公位置简写 */
  officeLocation: string
  /** 企业入驻状态 */
  status: EnterpriseStatus
}
