import { Drawer, Menu, Spin, Typography, type MenuProps } from 'antd'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useMenuStore } from '../../stores/menu'
import type { MenuItemDto } from '../../types/menu'
import { defaultMenuIcon, menuIconMap } from '../menu-icons'
import './sidebar-navigation.scss'

interface SidebarNavigationProps {
  desktopCollapsed: boolean
  mobileOpen: boolean
  onMobileClose: () => void
}

interface SidebarContentProps {
  activeNavigationKey?: string
  collapsed: boolean
  menuItems: MenuProps['items']
  menuLoading: boolean
  openMenuKeys: string[]
  onNavigate: (path: string) => void
  onOpenChange: (keys: string[]) => void
}

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

/**
 * 渲染桌面侧栏与移动端抽屉共用的品牌和导航菜单
 */
function SidebarContent({
  activeNavigationKey,
  collapsed,
  menuItems,
  menuLoading,
  openMenuKeys,
  onNavigate,
  onOpenChange,
}: SidebarContentProps) {
  return (
    <>
      <Typography.Title level={2} className="admin-brand" aria-label="智慧园区">
        <span className="admin-brand-full">智慧园区</span>
        <span className="admin-brand-short" aria-hidden="true">
          智
        </span>
      </Typography.Title>

      <nav className="admin-navigation">
        <Spin spinning={menuLoading}>
          <Menu
            className="admin-navigation-menu"
            mode="inline"
            inlineCollapsed={collapsed}
            items={menuItems}
            selectedKeys={activeNavigationKey ? [activeNavigationKey] : []}
            openKeys={collapsed ? undefined : openMenuKeys}
            onOpenChange={onOpenChange}
            onClick={({ key }) => onNavigate(key)}
          />
        </Spin>
      </nav>
    </>
  )
}

/**
 * 管理后台侧栏导航，统一承载桌面侧栏与移动端导航抽屉
 */
function SidebarNavigation({
  desktopCollapsed,
  mobileOpen,
  onMobileClose,
}: SidebarNavigationProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const menus = useMenuStore((state) => state.menus)
  const menuLoading = useMenuStore((state) => state.loading)
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
    onMobileClose()
    void navigate(path)
  }

  return (
    <>
      <aside id="admin-sidebar" className="admin-sidebar" aria-label="后台主导航">
        <SidebarContent
          activeNavigationKey={activeNavigationKey}
          collapsed={desktopCollapsed}
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
        open={mobileOpen}
        onClose={onMobileClose}
      >
        <aside className="admin-mobile-sidebar" aria-label="移动端后台主导航">
          <SidebarContent
            activeNavigationKey={activeNavigationKey}
            collapsed={false}
            menuItems={menuItems}
            menuLoading={menuLoading}
            openMenuKeys={displayedOpenMenuKeys}
            onNavigate={handleNavigate}
            onOpenChange={setOpenMenuKeys}
          />
        </aside>
      </Drawer>
    </>
  )
}

export default SidebarNavigation
