import type { PermissionCode } from '@/types/auth'
import type { PermissionNodeDto } from '@/types/system-role'

/** 将权限目录展开为节点列表，供受控勾选和权限依赖校验使用 */
export function flattenPermissionNodes(nodes: PermissionNodeDto[]): PermissionNodeDto[] {
  return nodes.flatMap((node) => [node, ...flattenPermissionNodes(node.children)])
}

/** 切换单个权限，操作自动补充页面访问，撤销页面时同步撤销页面内操作 */
export function togglePermission(
  nodes: PermissionNodeDto[],
  permissions: PermissionCode[],
  key: string,
  checked: boolean,
): PermissionCode[] {
  const flatNodes = flattenPermissionNodes(nodes)
  const target = flatNodes.find((node) => node.key === key)
  if (!target?.permission) return permissions
  const next = new Set(permissions)
  if (checked) {
    next.add(target.permission)
    for (const node of flatNodes) {
      if (node.permission && node.children.some((child) => child.key === key)) {
        next.add(node.permission)
      }
    }
  } else {
    next.delete(target.permission)
    // 同一访问权限可能关联多个页面，必须同时清除这些页面下的操作
    for (const node of flatNodes.filter((item) => item.permission === target.permission)) {
      for (const child of flattenPermissionNodes(node.children)) {
        if (child.permission) next.delete(child.permission)
      }
    }
  }
  return [...next]
}

/** 校验所有操作是否包含对应页面访问权限，不自动扩大提交的权限集合 */
export function hasValidPermissionDependencies(
  nodes: PermissionNodeDto[],
  permissions: PermissionCode[],
): boolean {
  const selected = new Set(permissions)
  return flattenPermissionNodes(nodes).every(
    (node) =>
      !node.permission ||
      node.children.every((child) => !child.permission || !selected.has(child.permission)) ||
      selected.has(node.permission),
  )
}
