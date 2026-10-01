import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Drawer, Dropdown, Menu, Spin, Typography, type MenuProps } from 'antd'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { useAuthStore } from '../stores/auth'
import { useMenuStore } from '../stores/menu'
import type { MenuItemDto } from '../types/menu'
import { defaultMenuIcon, menuIconMap } from './menu-icons'
import './layout.scss'

/**
 * 将后端菜单树转换为 Ant Design 菜单数据
 * @param menus 后端动态菜单树
 */
function createSidebarMenuItems(menus: MenuItemDto[]): MenuProps['items'] {
  return menus
    .filter((menu) => menu.visible)
    .toSorted((left, right) => left.sort - right.sort)
    .map((menu) => {
      const children = createSidebarMenuItems(menu.children)

      return {
        key: menu.path,
        icon: menu.icon ? (menuIconMap[menu.icon] ?? defaultMenuIcon) : undefined,
        label: menu.title,
        children: children?.length ? children : undefined,
      }
    })
}

/**
 * 查找与当前地址最精确匹配的菜单路径
 * @param menus 后端动态菜单树
 * @param pathname 当前页面路径
 */
function findActiveNavigationKey(menus: MenuItemDto[], pathname: string) {
  const menuPaths = menus.flatMap((menu) => [
    ...(menu.visible && menu.type === 'menu' ? [menu.path] : []),
    ...findMenuPaths(menu.children),
  ])

  return menuPaths
    .toSorted((left, right) => right.length - left.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * 递归收集可见的页面菜单路径
 * @param menus 后端动态菜单树
 */
function findMenuPaths(menus: MenuItemDto[]): string[] {
  return menus.flatMap((menu) => [
    ...(menu.visible && menu.type === 'menu' ? [menu.path] : []),
    ...findMenuPaths(menu.children),
  ])
}

/**
 * 查找选中菜单的所有上级目录路径
 * @param menus 后端动态菜单树
 * @param activeKey 当前选中的菜单路径
 */
function findAncestorMenuKeys(menus: MenuItemDto[], activeKey?: string): string[] {
  if (!activeKey) {
    return []
  }

  for (const menu of menus) {
    if (menu.path === activeKey) {
      return []
    }

    const childKeys = findAncestorMenuKeys(menu.children, activeKey)
    if (childKeys.length > 0 || menu.children.some((child) => child.path === activeKey)) {
      return [menu.path, ...childKeys]
    }
  }

  return []
}

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
  activeNavigationKey?: string
  menuItems: MenuProps['items']
  menuLoading: boolean
  openMenuKeys: string[]
  onNavigate: (path: string) => void
  onOpenChange: (keys: string[]) => void
}

/**
 * 渲染桌面侧栏与移动端抽屉共用的品牌和导航菜单
 */
function SidebarContent({
  activeNavigationKey,
  menuItems,
  menuLoading,
  openMenuKeys,
  onNavigate,
  onOpenChange,
}: SidebarContentProps) {
  return (
    <>
      <Typography.Title level={2} className="admin-brand">
        智慧园区
      </Typography.Title>

      <nav className="admin-navigation">
        <Spin spinning={menuLoading}>
          <Menu
            className="admin-navigation-menu"
            mode="inline"
            items={menuItems}
            selectedKeys={activeNavigationKey ? [activeNavigationKey] : []}
            openKeys={openMenuKeys}
            onOpenChange={onOpenChange}
            onClick={({ key }) => onNavigate(key)}
          />
        </Spin>
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
  const clearSession = useAuthStore((state) => state.clearSession)
  const menus = useMenuStore((state) => state.menus)
  const menuLoading = useMenuStore((state) => state.loading)
  const resetMenus = useMenuStore((state) => state.resetMenus)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([])

  const menuItems = useMemo(() => createSidebarMenuItems(menus), [menus])
  const activeNavigationKey = useMemo(
    () => findActiveNavigationKey(menus, pathname),
    [menus, pathname],
  )
  const activeAncestorMenuKeys = useMemo(
    () => findAncestorMenuKeys(menus, activeNavigationKey),
    [activeNavigationKey, menus],
  )
  const displayedOpenMenuKeys = useMemo(
    () => [...new Set([...openMenuKeys, ...activeAncestorMenuKeys])],
    [activeAncestorMenuKeys, openMenuKeys],
  )

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
      resetMenus()
      clearSession()
      void navigate('/login')
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="后台主导航">
        <SidebarContent
          activeNavigationKey={activeNavigationKey}
          menuItems={menuItems}
          menuLoading={menuLoading}
          openMenuKeys={displayedOpenMenuKeys}
          onNavigate={handleNavigate}
          onOpenChange={setOpenMenuKeys}
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
            menuItems={menuItems}
            menuLoading={menuLoading}
            openMenuKeys={displayedOpenMenuKeys}
            onNavigate={handleNavigate}
            onOpenChange={setOpenMenuKeys}
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
