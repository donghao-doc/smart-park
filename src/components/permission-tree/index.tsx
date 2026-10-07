import { Empty, Tree, Typography, type TreeDataNode } from 'antd'
import { useMemo } from 'react'

import type { PermissionCode } from '@/types/auth'
import type { PermissionNodeDto } from '@/types/system-role'
import { flattenPermissionNodes, togglePermission } from '@/utils/permissions'
import './permission-tree.scss'

interface PermissionTreeProps {
  /** 接口返回的完整菜单及操作权限目录 */
  nodes: PermissionNodeDto[]
  /** 当前角色的权限集合，多个页面共用的权限自动联动 */
  permissions: PermissionCode[]
  /** 是否仅查看权限或正在提交 */
  readOnly?: boolean
  /** 操作者可授予的权限，为空时不额外限制授权范围 */
  grantablePermissions?: PermissionCode[]
  /** 权限集合变化时通知表单 */
  onChange?: (permissions: PermissionCode[]) => void
}

/** 菜单与操作独立勾选，目录只组织节点，操作自动关联页面访问权限 */
function PermissionTree({
  nodes,
  permissions,
  readOnly = false,
  grantablePermissions,
  onChange,
}: PermissionTreeProps) {
  const selected = new Set(permissions)
  const checkedKeys = flattenPermissionNodes(nodes)
    .filter((node) => node.permission && selected.has(node.permission))
    .map((node) => node.key)
  const treeData = useMemo(() => {
    /** 将业务权限目录转换为 Ant Design 树节点，保持唯一节点标识 */
    function toTreeData(items: PermissionNodeDto[]): TreeDataNode[] {
      return items.map((node) => ({
        key: node.key,
        title: node.permission && node.children.length ? `${node.title}（页面访问）` : node.title,
        disableCheckbox:
          !node.permission ||
          (Boolean(grantablePermissions) &&
            !grantablePermissions!.includes(node.permission) &&
            !permissions.includes(node.permission)),
        children: toTreeData(node.children),
      }))
    }
    return toTreeData(nodes)
  }, [nodes, grantablePermissions, permissions])

  if (!nodes.length) return <Empty description="暂无权限目录" />

  return (
    <div className="permission-tree-panel">
      <Typography.Paragraph className="permission-tree-hint">
        {readOnly
          ? '已勾选的项目为该角色当前拥有的权限'
          : '页面访问与操作权限独立选择；勾选操作将自动选中页面，取消页面将清除相关操作'}
      </Typography.Paragraph>
      <Tree
        checkable
        checkStrictly
        selectable={false}
        defaultExpandAll
        disabled={readOnly}
        checkedKeys={{ checked: checkedKeys, halfChecked: [] }}
        treeData={treeData}
        onCheck={(_keys, info) => {
          onChange?.(togglePermission(nodes, permissions, String(info.node.key), info.checked))
        }}
      />
    </div>
  )
}

export default PermissionTree
