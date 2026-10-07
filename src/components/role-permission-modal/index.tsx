import { Alert, Button, Flex, Typography } from 'antd'
import { useState } from 'react'

import PermissionTree from '@/components/permission-tree'
import ScrollableModal from '@/components/scrollable-modal'
import type { PermissionCode, RoleDto } from '@/types/auth'
import type { PermissionNodeDto } from '@/types/system-role'
import './role-permission-modal.scss'

interface RolePermissionModalProps {
  /** 是否展示权限弹窗 */
  open: boolean
  /** 当前查看或配置的最新角色 */
  role?: RoleDto
  /** 接口返回的菜单及操作权限目录 */
  nodes: PermissionNodeDto[]
  /** 弹窗标题，用户查看时可包含用户名 */
  title?: string
  /** 是否仅查看，不允许保存 */
  readOnly?: boolean
  /** 操作者可授予的权限集合 */
  grantablePermissions?: PermissionCode[]
  /** 是否正在保存权限 */
  submitting?: boolean
  /** 提交新的角色权限集合 */
  onSave?: (permissions: PermissionCode[]) => void
  /** 用户权限查看时前往角色管理的入口 */
  onManageRoles?: () => void
  /** 关闭弹窗，提交期间由页面阻止关闭 */
  onCancel: () => void
}

/** 角色权限配置及用户生效权限查看共用弹窗 */
export default function RolePermissionModal({
  open,
  role,
  nodes,
  title,
  readOnly = false,
  grantablePermissions,
  submitting = false,
  onSave,
  onManageRoles,
  onCancel,
}: RolePermissionModalProps) {
  const [permissions, setPermissions] = useState<PermissionCode[]>(role?.permissions ?? [])

  return (
    <ScrollableModal
      className="role-permission-modal"
      open={open}
      title={title ?? (readOnly ? '查看角色权限' : '配置角色权限')}
      width={720}
      okText="保存权限"
      cancelText="取消"
      confirmLoading={submitting}
      closable={!submitting}
      keyboard={!submitting}
      mask={{ closable: !submitting }}
      cancelButtonProps={{ disabled: submitting }}
      onOk={() => onSave?.(permissions)}
      onCancel={onCancel}
      footer={
        readOnly ? (
          <Flex justify="end" gap={12}>
            {onManageRoles ? <Button onClick={onManageRoles}>前往角色管理</Button> : null}
            <Button type="primary" onClick={onCancel}>
              关闭
            </Button>
          </Flex>
        ) : undefined
      }
    >
      <Flex
        className="role-permission-summary"
        aria-label="角色权限概览"
        align="center"
        justify="space-between"
        wrap
        gap={8}
      >
        <Typography.Text strong>角色：{role?.name}</Typography.Text>
        <Typography.Text type="secondary">已授予 {permissions.length} 项权限</Typography.Text>
      </Flex>
      {!readOnly ? (
        <Alert
          className="role-permission-feedback"
          type="info"
          showIcon
          title="保存后将对所有使用此角色的用户生效"
          description="不勾选任何权限时，该角色仍可登录并访问个人中心，无法访问业务页面"
        />
      ) : null}
      <PermissionTree
        nodes={nodes}
        permissions={permissions}
        readOnly={readOnly || submitting}
        grantablePermissions={grantablePermissions}
        onChange={setPermissions}
      />
    </ScrollableModal>
  )
}
