import type { PermissionCode } from './auth'

/**
 * 后台菜单节点类型
 */
export type MenuType = 'directory' | 'menu'

/**
 * 后端动态菜单节点
 */
export interface MenuItemDto {
  /** 菜单稳定唯一标识 */
  id: string
  /** 菜单节点类型，目录仅用于组织子菜单 */
  type: MenuType
  /** 菜单显示名称 */
  title: string
  /** 前端路由名称，用于路由缓存和页面定位 */
  routeName: string
  /** 路由访问路径 */
  path: string
  /** 前端组件白名单标识，目录节点为 layout */
  componentKey: string
  /** Ant Design 图标组件名称，未配置图标时为 null */
  icon: string | null
  /** 菜单排序值，数值越小越靠前 */
  sort: number
  /** 是否在侧边栏显示 */
  visible: boolean
  /** 访问菜单需要的权限点，目录节点为 null */
  permission: PermissionCode | null
  /** 目录默认跳转地址，普通菜单为 null */
  redirect: string | null
  /** 当前节点下经过权限过滤的子菜单 */
  children: MenuItemDto[]
}
