import type { PageResult } from './api'

/**
 * 人员在园区企业中的任职状态
 */
export type PersonnelStatus = 'active' | 'resigned' | 'suspended'

/**
 * 人员证件类型
 */
export type PersonnelCertificateType = 'identity_card' | 'passport' | 'hk_macao_permit'

/**
 * 人员列表与详情共用的数据结构
 */
export interface PersonnelDto {
  /** 人员稳定唯一标识 */
  id: string
  /** 人员姓名 */
  name: string
  /** 手机号码 */
  phone: string
  /** 证件类型 */
  certificateType: PersonnelCertificateType
  /** 证件号码 */
  certificateNumber: string
  /** 园区内部工号 */
  employeeNumber: string
  /** 所属企业稳定唯一标识 */
  enterpriseId: string
  /** 所属企业名称快照 */
  enterpriseName: string
  /** 所属部门 */
  department: string
  /** 当前任职状态 */
  status: PersonnelStatus
  /** 数据创建时间，ISO 8601 格式 */
  createdAt: string
  /** 数据最后更新时间，ISO 8601 格式 */
  updatedAt: string
}

/**
 * 人员列表查询参数
 */
export interface PersonnelListParams {
  /** 当前页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 姓名关键词 */
  name?: string
  /** 手机号码关键词 */
  phone?: string
  /** 所属企业稳定唯一标识 */
  enterpriseId?: string
  /** 任职状态筛选 */
  status?: PersonnelStatus
}

/**
 * 人员分页列表响应数据
 */
export type PersonnelPageResult = PageResult<PersonnelDto>

/**
 * 创建或编辑人员时提交的数据
 */
export interface PersonnelMutationRequest {
  /** 人员姓名 */
  name: string
  /** 手机号码 */
  phone: string
  /** 证件类型 */
  certificateType: PersonnelCertificateType
  /** 证件号码 */
  certificateNumber: string
  /** 园区内部工号 */
  employeeNumber: string
  /** 所属企业稳定唯一标识 */
  enterpriseId: string
  /** 所属部门 */
  department: string
  /** 当前任职状态 */
  status: PersonnelStatus
}

/**
 * 更新人员任职状态时提交的数据
 */
export interface UpdatePersonnelStatusRequest {
  /** 目标任职状态 */
  status: PersonnelStatus
}
