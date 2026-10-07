import type { PageResult } from '@/types/api'
import type { PermissionCode, RoleDto } from '@/types/auth'

/** 角色管理列表中的角色配置及关联用户数量 */
export interface SystemRoleDto extends RoleDto {
  /** 当前分配此角色的用户数，包含已停用用户 */
  userCount: number
}

/** 角色分页查询条件 */
export interface RoleListParams {
  /** 当前页码，从 1 开始 */
  page?: number
  /** 每页条数，最大 100 */
  pageSize?: number
  /** 模糊匹配角色名称或编码 */
  keyword?: string
}

/** 角色分页查询结果 */
export type RolePageResult = PageResult<SystemRoleDto>

/** 创建角色的基本资料及初始权限，复制角色时提交已有权限 */
export interface CreateRoleRequest {
  /** 唯一角色编码，以字母开头，支持数字、下划线和连字符 */
  code: string
  /** 角色名称，最多 30 个字符 */
  name: string
  /** 角色适用场景说明，最多 200 个字符 */
  description: string
  /** 初始权限集合，新建角色默认为空 */
  permissions: PermissionCode[]
}

/** 编辑角色基本资料，角色编码及既有数据范围不可变更 */
export interface UpdateRoleRequest {
  /** 角色名称，最多 30 个字符 */
  name: string
  /** 角色适用场景说明，最多 200 个字符 */
  description: string
}

/** 保存角色的完整权限集合，空数组表示撤销所有业务权限 */
export interface UpdateRolePermissionsRequest {
  /** 页面访问权限及依赖页面访问的操作权限 */
  permissions: PermissionCode[]
}

/** 权限配置目录中的节点，目录不授予权限，页面与操作独立勾选 */
export interface PermissionNodeDto {
  /** 树节点稳定标识，同一权限可关联多个页面，节点标识仍保持唯一 */
  key: string
  /** 页面、目录或操作的中文名称 */
  title: string
  /** 对应权限编码，纯目录节点为 null */
  permission: PermissionCode | null
  /** 子页面或页面内的操作节点 */
  children: PermissionNodeDto[]
}
