import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  CalendarOutlined,
  CarOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FieldTimeOutlined,
  HddOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ProfileOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

/**
 * 后端菜单图标名称与 Ant Design 图标的安全映射
 */
export const menuIconMap: Readonly<Record<string, ReactNode>> = {
  ApartmentOutlined: <ApartmentOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  AuditOutlined: <AuditOutlined />,
  BankOutlined: <BankOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  CarOutlined: <CarOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  FieldTimeOutlined: <FieldTimeOutlined />,
  HddOutlined: <HddOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  IdcardOutlined: <IdcardOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  ToolOutlined: <ToolOutlined />,
  UserOutlined: <UserOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
}

/** 后端图标名称无法识别时使用的默认菜单图标 */
export const defaultMenuIcon = <AppstoreOutlined />
