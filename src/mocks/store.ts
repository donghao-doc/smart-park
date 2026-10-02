import { seedEnterprises, type MockEnterpriseEntity } from './data/enterprises'
import type { MockUserEntity } from './data/users'
import { seedUsers } from './data/users'

const MOCK_STORE_KEY = 'smart-park.mock-state.v4'
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
  return Array.isArray(state.users) && Array.isArray(state.enterprises) && Array.isArray(state.sessions)
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
    if (isMockState(parsedState)) {
      return parsedState
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
