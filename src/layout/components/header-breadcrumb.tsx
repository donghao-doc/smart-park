import { Breadcrumb, type BreadcrumbProps } from 'antd'
import { useMemo } from 'react'
import { Link, matchPath, useLocation } from 'react-router'

import { useMenuStore } from '@/stores/menu'
import type { MenuItemDto } from '@/types/menu'
import './header-breadcrumb.scss'

const detailRoutes = [
  {
    path: '/work-orders/:id',
    parentPath: '/work-orders',
    title: '工单详情',
  },
  {
    path: '/enterprises/:id',
    parentPath: '/enterprises',
    title: '企业详情',
  },
]

/**
 * 从菜单树中查找当前地址对应的完整菜单层级
 * @param menus 当前账号可访问的菜单树
 * @param pathname 当前页面路径
 */
function findMenuTrail(menus: MenuItemDto[], pathname: string): MenuItemDto[] {
  for (const menu of menus) {
    const childTrail = findMenuTrail(menu.children, pathname)
    if (childTrail.length > 0) {
      return [menu, ...childTrail]
    }

    if (
      menu.type === 'menu' &&
      (pathname === menu.path || pathname.startsWith(`${menu.path}/`))
    ) {
      return [menu]
    }
  }

  return []
}

/**
 * 展示当前业务页面在动态菜单中的层级路径
 */
function HeaderBreadcrumb() {
  const { pathname } = useLocation()
  const menus = useMenuStore((state) => state.menus)

  const items = useMemo<BreadcrumbProps['items']>(() => {
    const menuTrail = findMenuTrail(menus, pathname)
    const detailRoute = detailRoutes.find((route) => matchPath(route.path, pathname))

    const breadcrumbItems = menuTrail.map((menu, index) => {
      const isDetailParent = detailRoute?.parentPath === menu.path
      const isCurrentPage = index === menuTrail.length - 1 && !isDetailParent
      const targetPath = menu.type === 'directory' ? (menu.redirect ?? menu.path) : menu.path

      return {
        title: isCurrentPage ? menu.title : <Link to={targetPath}>{menu.title}</Link>,
      }
    })

    if (detailRoute) {
      breadcrumbItems.push({ title: detailRoute.title })
    }

    return breadcrumbItems
  }, [menus, pathname])

  if (!items?.length) {
    return null
  }

  return <Breadcrumb className="admin-header-breadcrumb" items={items} />
}

export default HeaderBreadcrumb
