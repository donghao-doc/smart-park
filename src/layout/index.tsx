import {
  AppstoreOutlined,
  BankOutlined,
  BellOutlined,
  CarOutlined,
  DownOutlined,
  HddOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Drawer, Dropdown, Input, Menu, Typography, type MenuProps } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import './layout.scss'

const navigationItems = [
  { key: '/dashboard', label: '运营总览', icon: AppstoreOutlined },
  { key: '/enterprises', label: '企业管理', icon: BankOutlined },
  { key: '/personnel', label: '人员管理', icon: TeamOutlined },
  { key: '/visitors/appointments', label: '访客管理', icon: UserSwitchOutlined },
  { key: '/parking/vehicles', label: '停车管理', icon: CarOutlined },
  { key: '/work-orders', label: '工单中心', icon: ProfileOutlined },
  { key: '/devices', label: '设备管理', icon: HddOutlined },
  { key: '/system/users', label: '系统管理', icon: SettingOutlined },
]

const sidebarMenuItems: MenuProps['items'] = navigationItems.map(
  ({ key, label, icon: Icon }) => ({
    key,
    icon: <Icon />,
    label,
  }),
)

const accountMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人中心',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
]

interface SidebarContentProps {
  activeNavigationKey: string
  onNavigate: (path: string) => void
}

/**
 * 渲染桌面侧栏与移动端抽屉共用的品牌和导航菜单
 */
function SidebarContent({ activeNavigationKey, onNavigate }: SidebarContentProps) {
  return (
    <>
      <Typography.Title level={2} className="admin-brand">
        智慧园区
      </Typography.Title>

      <nav className="admin-navigation">
        <Menu
          className="admin-navigation-menu"
          mode="inline"
          items={sidebarMenuItems}
          selectedKeys={[activeNavigationKey]}
          onClick={({ key }) => onNavigate(key)}
        />
      </nav>
    </>
  )
}

/**
 * 管理后台通用布局，承载品牌侧栏、顶部工具栏和业务页面出口
 */
function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeNavigationKey =
    navigationItems.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`))?.key ??
    '/dashboard'

  /**
   * 切换菜单后关闭移动端抽屉，保持内容区域可见
   */
  function handleNavigate(path: string) {
    setMobileMenuOpen(false)
    void navigate(path)
  }

  /**
   * 处理静态用户菜单，退出项返回登录页
   */
  function handleAccountMenu({ key }: { key: string }) {
    if (key === 'logout') {
      void navigate('/login')
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="后台主导航">
        <SidebarContent
          activeNavigationKey={activeNavigationKey}
          onNavigate={handleNavigate}
        />
      </aside>

      <Drawer
        rootClassName="admin-sidebar-drawer"
        placement="left"
        size={242}
        closable={false}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <aside className="admin-mobile-sidebar" aria-label="移动端后台主导航">
          <SidebarContent
            activeNavigationKey={activeNavigationKey}
            onNavigate={handleNavigate}
          />
        </aside>
      </Drawer>

      <div className="admin-workspace">
        <header className="admin-header">
          <Button
            type="text"
            className="admin-sidebar-toggle admin-sidebar-toggle-mobile"
            icon={<MenuUnfoldOutlined />}
            aria-label="打开导航菜单"
            onClick={() => setMobileMenuOpen(true)}
          />

          <div className="admin-header-tools">
            <Input
              className="admin-global-search"
              prefix={<SearchOutlined />}
              placeholder="搜索企业、人员、设备等"
              aria-label="全局搜索"
              allowClear
            />

            <Badge dot offset={[-2, 4]}>
              <Button
                type="text"
                className="admin-notification-button"
                icon={<BellOutlined />}
                aria-label="通知，有未读消息"
              />
            </Badge>

            <Dropdown
              menu={{ items: accountMenuItems, onClick: handleAccountMenu }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="text" className="admin-account" aria-label="打开用户菜单">
                <Avatar className="admin-account-avatar" icon={<UserOutlined />} />
                <span className="admin-account-name">张三</span>
                <DownOutlined className="admin-account-arrow" />
              </Button>
            </Dropdown>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
