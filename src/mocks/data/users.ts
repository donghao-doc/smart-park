import type { PermissionCode, RoleCode, RoleDto, UserStatus } from '@/types/auth'

/**
 * Mock 层内部使用的用户实体，密码只保存在 Mock 存储中
 */
export interface MockUserEntity {
  /** 用户稳定唯一标识 */
  id: string
  /** 登录账号 */
  username: string
  /** 用户姓名 */
  name: string
  /** Mock 登录密码，不得直接返回给页面 */
  password: string
  /** 固定角色编码 */
  roleCode: RoleCode
  /** 企业用户所属企业标识 */
  enterpriseId: string | null
  /** 账号启停状态 */
  status: UserStatus
  /** 最近一次成功登录时间 */
  lastLoginAt: string | null
  /** 账号创建时间 */
  createdAt: string
  /** 账号最后更新时间 */
  updatedAt: string
}

const superAdminPermissions: PermissionCode[] = [
  'dashboard:view',
  'park:view',
  'park:update',
  'enterprise:view',
  'enterprise:create',
  'enterprise:update',
  'enterprise:status',
  'personnel:view',
  'personnel:create',
  'personnel:update',
  'personnel:status',
  'visitor:view',
  'visitor:create',
  'visitor:approve',
  'visitor:check-in',
  'visitor:check-out',
  'visitor:cancel',
  'vehicle:view',
  'vehicle:create',
  'vehicle:update',
  'vehicle:status',
  'parking-record:view',
  'work-order:view',
  'work-order:create',
  'work-order:process',
  'work-order:confirm',
  'work-order:cancel',
  'work-order:reopen',
  'device:view',
  'device:create',
  'device:update',
  'device:status',
  'system-user:view',
  'system-user:create',
  'system-user:update',
  'system-user:status',
  'system-user:reset-password',
  'operation-log:view',
  'mock-data:manage',
]

const operatorPermissions: PermissionCode[] = [
  'dashboard:view',
  'park:view',
  'enterprise:view',
  'enterprise:create',
  'enterprise:update',
  'enterprise:status',
  'personnel:view',
  'personnel:create',
  'personnel:update',
  'personnel:status',
  'visitor:view',
  'visitor:create',
  'visitor:approve',
  'visitor:check-in',
  'visitor:check-out',
  'visitor:cancel',
  'vehicle:view',
  'vehicle:create',
  'vehicle:update',
  'vehicle:status',
  'parking-record:view',
  'work-order:view',
  'work-order:create',
  'work-order:process',
  'device:view',
  'device:create',
  'device:update',
  'device:status',
  'operation-log:view',
]

const enterpriseUserPermissions: PermissionCode[] = [
  'dashboard:view',
  'enterprise:view',
  'personnel:view',
  'visitor:view',
  'visitor:create',
  'visitor:cancel',
  'vehicle:view',
  'parking-record:view',
  'work-order:view',
  'work-order:create',
  'work-order:confirm',
]

/**
 * 系统固定角色配置
 */
export const mockRoles: Record<RoleCode, RoleDto> = {
  super_admin: {
    code: 'super_admin',
    name: '超级管理员',
    description: '负责系统维护，可访问全部数据并管理账号与 Mock 配置',
    dataScope: 'all',
    permissions: superAdminPermissions,
  },
  park_operator: {
    code: 'park_operator',
    name: '园区运营人员',
    description: '负责当前园区的日常运营及业务流程处理',
    dataScope: 'park',
    permissions: operatorPermissions,
  },
  enterprise_user: {
    code: 'enterprise_user',
    name: '企业用户',
    description: '查看所属企业数据并发起访客预约和工单',
    dataScope: 'enterprise',
    permissions: enterpriseUserPermissions,
  },
}

/**
 * 用户管理标准种子数据，包含三个演示登录账号及分页所需的业务账号
 */
export const seedUsers: MockUserEntity[] = [
  {
    id: 'usr_1001',
    username: 'admin',
    name: '系统维护员',
    password: 'Admin@123',
    roleCode: 'super_admin',
    enterpriseId: null,
    status: 'active',
    lastLoginAt: null,
    createdAt: '2026-09-01T01:00:00.000Z',
    updatedAt: '2026-09-01T01:00:00.000Z',
  },
  {
    id: 'usr_1002',
    username: 'operator',
    name: '园区运营专员',
    password: 'Operator@123',
    roleCode: 'park_operator',
    enterpriseId: null,
    status: 'active',
    lastLoginAt: null,
    createdAt: '2026-09-01T01:05:00.000Z',
    updatedAt: '2026-09-01T01:05:00.000Z',
  },
  {
    id: 'usr_1003',
    username: 'enterprise',
    name: '企业服务专员',
    password: 'Enterprise@123',
    roleCode: 'enterprise_user',
    enterpriseId: 'ent_1001',
    status: 'active',
    lastLoginAt: null,
    createdAt: '2026-09-01T01:10:00.000Z',
    updatedAt: '2026-09-01T01:10:00.000Z',
  },
]

const sampleNames = ['赵六', '孙七', '周八', '吴九', '周十', '陈一', '张二']
const sampleUsernames = ['zhaoliu', 'sunqi', 'zhouba', 'wujiu', 'zhoushi', 'chenyi', 'zhanger']
// 仅关联仍在入驻的企业，保证企业归属符合用户创建约束
const activeEnterpriseIds = ['ent_1001', 'ent_1002', 'ent_1003', 'ent_1005', 'ent_1006', 'ent_1007']

/** 创建覆盖不同角色、启停状态及首次登录状态的用户样本 */
function createSampleUser(index: number): MockUserEntity {
  const sequence = index + 4
  const sampleIndex = index % sampleNames.length
  const roleCode: RoleCode = index % 4 === 1 ? 'park_operator' : 'enterprise_user'
  const createdAt = new Date(Date.UTC(2026, 7, 31, 16) - index * 3_600_000).toISOString()
  const lastLoginAt =
    index % 9 === 0 ? null : new Date(Date.UTC(2026, 9, 3, 8, 45) - index * 3_600_000).toISOString()

  return {
    id: `usr_${1000 + sequence}`,
    username:
      index < sampleNames.length
        ? sampleUsernames[sampleIndex]
        : `${sampleUsernames[sampleIndex]}${sequence}`,
    name: sampleNames[sampleIndex],
    password: 'User@12345',
    roleCode,
    enterpriseId:
      roleCode === 'enterprise_user'
        ? activeEnterpriseIds[index % activeEnterpriseIds.length]
        : null,
    status: index % 5 === 0 ? 'disabled' : 'active',
    lastLoginAt,
    createdAt,
    updatedAt: lastLoginAt ?? createdAt,
  }
}

seedUsers.push(...Array.from({ length: 53 }, (_value, index) => createSampleUser(index)))
