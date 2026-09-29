import {
  ApartmentOutlined,
  AppstoreOutlined,
  BankOutlined,
  CarOutlined,
  DashboardOutlined,
  HddOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

/**
 * 后端菜单图标名称与 Ant Design 图标的安全映射
 */
export const menuIconMap: Readonly<Record<string, ReactNode>> = {
  ApartmentOutlined: <ApartmentOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  BankOutlined: <BankOutlined />,
  CarOutlined: <CarOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  HddOutlined: <HddOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  ToolOutlined: <ToolOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
}

/** 后端图标名称无法识别时使用的默认菜单图标 */
export const defaultMenuIcon = <AppstoreOutlined />
