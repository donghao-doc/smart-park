import { seedEnterprises, type MockEnterpriseEntity } from './data/enterprises'
import { seedPersonnel } from './data/personnel'
import type { MockUserEntity } from './data/users'
import { seedUsers } from './data/users'
import { seedVisitorAppointments } from './data/visitor-appointments'
import { seedVehicles } from './data/vehicles'

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
  /** 当前有效或待清理的登录会话 */
  sessions: MockSession[]
}

/**
 * 创建与种子数据相互隔离的初始状态
 */
function createInitialState(): MockState {
  return {
    users: structuredClone(seedUsers),
    enterprises: structuredClone(seedEnterprises),
    personnel: structuredClone(seedPersonnel),
    visitorAppointments: structuredClone(seedVisitorAppointments),
    vehicles: structuredClone(seedVehicles),
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
    Array.isArray(state.users) &&
    Array.isArray(state.enterprises) &&
    Array.isArray(state.personnel) &&
    Array.isArray(state.visitorAppointments) &&
    Array.isArray(state.vehicles) &&
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
    // 兼容已有演示数据，仅补充车辆模块，保留企业、人员和登录会话
    const compatibleState = parsedState && typeof parsedState === 'object' && !('vehicles' in parsedState)
      ? { ...parsedState, vehicles: structuredClone(seedVehicles) }
      : parsedState
    if (isMockState(compatibleState)) {
      if (compatibleState !== parsedState) saveMockState(compatibleState)
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
