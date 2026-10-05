import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, type MenuProps } from 'antd'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import HeaderBreadcrumb from './components/header-breadcrumb'
import SidebarNavigation from './components/sidebar-navigation'
import './layout.scss'

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

/**
 * 管理后台通用布局，承载品牌侧栏、顶部工具栏和业务页面出口
 */
function AdminLayout() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)
  const resetMenus = useMenuStore((state) => state.resetMenus)
  const currentUserName = useUserStore((state) => state.currentUser?.name ?? '用户')
  const resetUser = useUserStore((state) => state.resetUser)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /**
   * 打开个人中心，或清除当前会话并返回登录页
   */
  function handleAccountMenu({ key }: { key: string }) {
    if (key === 'profile') {
      void navigate('/profile')
      return
    }

    if (key === 'logout') {
      resetMenus()
      resetUser()
      clearSession()
      void navigate('/login')
    }
  }

  return (
    <div className={`admin-layout${desktopSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <SidebarNavigation
        desktopCollapsed={desktopSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="admin-workspace">
        <header className="admin-header">
          <Button
            type="text"
            className="admin-sidebar-toggle admin-sidebar-toggle-desktop"
            icon={desktopSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={desktopSidebarCollapsed ? '展开导航菜单' : '折叠导航菜单'}
            aria-controls="admin-sidebar"
            aria-expanded={!desktopSidebarCollapsed}
            onClick={() => setDesktopSidebarCollapsed((collapsed) => !collapsed)}
          />

          <Button
            type="text"
            className="admin-sidebar-toggle admin-sidebar-toggle-mobile"
            icon={<MenuUnfoldOutlined />}
            aria-label="打开导航菜单"
            onClick={() => setMobileMenuOpen(true)}
          />

          <HeaderBreadcrumb />

          <div className="admin-header-tools">
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
                <span className="admin-account-name">{currentUserName}</span>
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
