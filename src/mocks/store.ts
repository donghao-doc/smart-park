import { seedEnterprises, type MockEnterpriseEntity } from './data/enterprises'
import { seedPersonnel } from './data/personnel'
import type { MockUserEntity } from './data/users'
import { mockRoles, seedUsers } from './data/users'
import type { RoleDto } from '@/types/auth'
import type { OperationLogDetailDto } from '@/types/operation-log'
import { seedVisitorAppointments } from './data/visitor-appointments'
import { seedVehicles } from './data/vehicles'
import { seedWorkOrders, workOrderSampleImages } from './data/work-orders'
import { seedDevices } from './data/devices'
import { seedParkInfo } from './data/park-profile'

const MOCK_STORE_KEY = 'smart-park.mock-state.v13'
const SESSION_DURATION_SECONDS = 2 * 60 * 60

/**
 * Mock 登录会话
 */
export interface MockSession {
  /** 会话访问令牌 */
  accessToken: string
  /** 会话关联用户标识 */
  userId: string
  /** 会话过期时间 */
  expiresAt: string
}

/**
 * 浏览器中持久化的 Mock 数据
 */
export interface MockState {
  /** 园区基础信息，与业务修改一同持久化并参与数据重置 */
  parkInfo: typeof seedParkInfo
  /** 用户种子数据版本，用于增量补充演示账号而不覆盖已有修改 */
  userSeedVersion: number
  /** 角色权限种子版本，用于增量拆分既有访问权限 */
  roleSeedVersion: number
  /** 可编辑角色及其权限配置 */
  roles: RoleDto[]
  /** 角色维护和用户授权的历史审计快照 */
  authorizationLogs: OperationLogDetailDto[]
  /** 当前用户数据 */
  users: MockUserEntity[]
  /** 企业摘要数据 */
  enterprises: MockEnterpriseEntity[]
  /** 园区人员数据 */
  personnel: typeof seedPersonnel
  /** 访客预约数据 */
  visitorAppointments: typeof seedVisitorAppointments
  /** 园区备案车辆档案 */
  vehicles: typeof seedVehicles
  /** 工单资料及可回溯的流程记录 */
  workOrders: typeof seedWorkOrders
  /** 园区设备档案及最近状态变化记录 */
  devices: typeof seedDevices
  /** 当前有效或待清理的登录会话 */
  sessions: MockSession[]
}

/**
 * 创建与种子数据相互隔离的初始状态
 */
function createInitialState(): MockState {
  return {
    parkInfo: structuredClone(seedParkInfo),
    userSeedVersion: 1,
    roleSeedVersion: 1,
    roles: structuredClone(Object.values(mockRoles)),
    authorizationLogs: [],
    users: structuredClone(seedUsers),
    enterprises: structuredClone(seedEnterprises),
    personnel: structuredClone(seedPersonnel),
    visitorAppointments: structuredClone(seedVisitorAppointments),
    vehicles: structuredClone(seedVehicles),
    workOrders: structuredClone(seedWorkOrders),
    devices: structuredClone(seedDevices),
    sessions: [],
  }
}

/**
 * 判断持久化数据是否具备当前版本所需的基本结构
 */
function isMockState(value: unknown): value is MockState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<MockState>
  return (
    !!state.parkInfo &&
    typeof state.parkInfo === 'object' &&
    !Array.isArray(state.parkInfo) &&
    Array.isArray(state.roles) &&
    Array.isArray(state.authorizationLogs) &&
    Array.isArray(state.users) &&
    Array.isArray(state.enterprises) &&
    Array.isArray(state.personnel) &&
    Array.isArray(state.visitorAppointments) &&
    Array.isArray(state.vehicles) &&
    Array.isArray(state.workOrders) &&
    Array.isArray(state.devices) &&
    Array.isArray(state.sessions)
  )
}

/**
 * 读取浏览器中的 Mock 数据，数据损坏时自动恢复种子数据
 */
export function getMockState(): MockState {
  const rawState = localStorage.getItem(MOCK_STORE_KEY)

  if (!rawState) {
    const initialState = createInitialState()
    saveMockState(initialState)
    return initialState
  }

  try {
    const parsedState: unknown = JSON.parse(rawState)
    // 增量补充园区档案和新增业务模块，保留已有业务修改及登录会话
    const compatibleState =
      parsedState &&
      typeof parsedState === 'object' &&
      (!('parkInfo' in parsedState) ||
        !('vehicles' in parsedState) ||
        !('workOrders' in parsedState) ||
        !('devices' in parsedState) ||
        !('roles' in parsedState) ||
        !('authorizationLogs' in parsedState))
        ? {
            ...parsedState,
            roles:
              'roles' in parsedState
                ? parsedState.roles
                : structuredClone(Object.values(mockRoles)),
            authorizationLogs:
              'authorizationLogs' in parsedState ? parsedState.authorizationLogs : [],
            parkInfo:
              'parkInfo' in parsedState ? parsedState.parkInfo : structuredClone(seedParkInfo),
            vehicles:
              'vehicles' in parsedState ? parsedState.vehicles : structuredClone(seedVehicles),
            workOrders:
              'workOrders' in parsedState
                ? parsedState.workOrders
                : structuredClone(seedWorkOrders),
            devices: 'devices' in parsedState ? parsedState.devices : structuredClone(seedDevices),
          }
        : parsedState
    if (isMockState(compatibleState)) {
      // 拆分原有访客页面访问权限，既有用户保留原访问能力，自定义授权之后不会重复补齐
      const rolesMigrated = compatibleState.roleSeedVersion !== 1
      if (rolesMigrated) {
        for (const role of compatibleState.roles) {
          if (
            role.permissions.includes('visitor:view') &&
            !role.permissions.includes('visitor-record:view')
          ) {
            role.permissions.push('visitor-record:view')
          }
        }
        const administrator = compatibleState.roles.find((role) => role.code === 'super_admin')
        if (administrator) administrator.permissions = [...mockRoles.super_admin.permissions]
        compatibleState.roleSeedVersion = 1
      }
      // 旧存储只补充缺失的账号，保留已编辑资料、密码、启停状态和会话
      const usersMigrated = compatibleState.userSeedVersion !== 1
      if (usersMigrated) {
        const existingIds = new Set(compatibleState.users.map((user) => user.id))
        const existingUsernames = new Set(
          compatibleState.users.map((user) => user.username.toLowerCase()),
        )
        const missingUsers = seedUsers.filter(
          (user) =>
            !existingIds.has(user.id) && !existingUsernames.has(user.username.toLowerCase()),
        )
        compatibleState.users.push(...structuredClone(missingUsers))
        compatibleState.userSeedVersion = 1
      }
      // 将旧版图片占位迁移为示例附件，不重置已有工单和登录会话
      let imagesMigrated = false
      for (const order of compatibleState.workOrders) {
        if (!Array.isArray(order.images)) {
          const legacy = order as typeof order & { imageNames?: string[] }
          order.images = structuredClone(
            seedWorkOrders.find((item) => item.id === order.id)?.images ??
              (legacy.imageNames?.length ? [workOrderSampleImages[0]] : []),
          )
          delete legacy.imageNames
          imagesMigrated = true
        }
      }
      if (compatibleState !== parsedState || imagesMigrated || usersMigrated || rolesMigrated) {
        saveMockState(compatibleState)
      }
      return compatibleState
    }
  } catch {
    // 持久化数据无法解析时使用标准种子数据恢复演示环境
  }

  const initialState = createInitialState()
  saveMockState(initialState)
  return initialState
}

/**
 * 保存完整 Mock 状态
 */
export function saveMockState(state: MockState) {
  localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(state))
}

/** 恢复全部可修改业务数据并清除模拟会话，保留其他应用的存储 */
export function resetMockState() {
  saveMockState(createInitialState())
}

/**
 * 为用户创建新的限时登录会话
 */
export function createMockSession(state: MockState, userId: string): MockSession {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString()
  const session: MockSession = {
    accessToken: `mock_${crypto.randomUUID()}`,
    userId,
    expiresAt,
  }

  state.sessions = state.sessions.filter((item) => item.userId !== userId)
  state.sessions.push(session)
  return session
}

/**
 * Mock Token 的有效期秒数
 */
export const mockSessionDurationSeconds = SESSION_DURATION_SECONDS
