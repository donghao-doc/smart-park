import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Grid, Tag, Tooltip, type TableColumnsType } from 'antd'

import DataTablePanel from '@/components/data-table-panel'
import type { SystemRoleDto } from '@/types/system-role'
import './role-table.scss'

interface RoleTableProps {
  /** 当前页角色列表 */
  roles: SystemRoleDto[]
  /** 筛选后的角色总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 是否加载列表 */
  loading: boolean
  /** 列表加载是否失败 */
  loadError: boolean
  /** 正在加载详情的角色编码 */
  loadingCode?: string
  /** 是否允许新增角色 */
  canCreate: boolean
  /** 是否允许编辑基本资料 */
  canUpdate: boolean
  /** 是否允许配置权限 */
  canGrant: boolean
  /** 是否允许删除未关联用户的自定义角色 */
  canDelete: boolean
  /** 是否允许查看关联用户 */
  canViewUsers: boolean
  /** 打开新增角色表单 */
  onCreate: () => void
  /** 编辑或复制最新角色资料 */
  onEdit: (role: SystemRoleDto, copy: boolean) => void
  /** 查看或配置权限 */
  onPermissions: (role: SystemRoleDto) => void
  /** 确认后删除角色 */
  onDelete: (role: SystemRoleDto) => void
  /** 前往用户管理并按角色筛选 */
  onViewUsers: (role: SystemRoleDto) => void
  /** 重试加载角色列表 */
  onRetry: () => void
  /** 切换页码或每页条数 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 角色列表，区分内置角色保护、权限配置及关联用户操作 */
export default function RoleTable({
  roles,
  total,
  page,
  pageSize,
  loading,
  loadError,
  loadingCode,
  canCreate,
  canUpdate,
  canGrant,
  canDelete,
  canViewUsers,
  onCreate,
  onEdit,
  onPermissions,
  onDelete,
  onViewUsers,
  onRetry,
  onPageChange,
}: RoleTableProps) {
  const screens = Grid.useBreakpoint()
  const columns: TableColumnsType<SystemRoleDto> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 170,
      ellipsis: true,
    },
    {
      title: '类型',
      key: 'type',
      width: 90,
      render: (_value, role) => (
        <Tag color={role.builtIn ? 'blue' : undefined}>{role.builtIn ? '内置' : '自定义'}</Tag>
      ),
    },
    {
      title: '角色说明',
      dataIndex: 'description',
      width: 230,
      ellipsis: true,
    },
    {
      title: '数据范围',
      key: 'scope',
      width: 100,
      render: (_value, role) =>
        ({ all: '全部数据', park: '园区', enterprise: '所属企业' })[role.dataScope],
    },
    {
      title: '关联用户',
      dataIndex: 'userCount',
      width: 100,
      render: (_value, role) =>
        canViewUsers ? (
          <Button type="link" onClick={() => onViewUsers(role)}>
            {role.userCount} 人
          </Button>
        ) : (
          `${role.userCount} 人`
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      fixed: screens.lg ? 'right' : undefined,
      render: (_value, role) => (
        <Flex className="role-table-actions" align="center" gap={2}>
          {canUpdate ? (
            <Button
              type="link"
              disabled={role.code === 'super_admin' || Boolean(loadingCode)}
              onClick={() => onEdit(role, false)}
            >
              编辑
            </Button>
          ) : null}
          <Button
            type="link"
            loading={loadingCode === role.code}
            disabled={Boolean(loadingCode) && loadingCode !== role.code}
            onClick={() => onPermissions(role)}
          >
            {canGrant && role.code !== 'super_admin' ? '配置权限' : '查看权限'}
          </Button>
          {canCreate && canGrant ? (
            <Button type="link" disabled={Boolean(loadingCode)} onClick={() => onEdit(role, true)}>
              复制
            </Button>
          ) : null}
          {canDelete ? (
            <Tooltip
              title={
                role.builtIn
                  ? '内置角色不可删除'
                  : role.userCount
                    ? '请先调整关联用户的角色'
                    : undefined
              }
            >
              <Button
                type="link"
                danger
                disabled={role.builtIn || role.userCount > 0 || Boolean(loadingCode)}
                onClick={() => onDelete(role)}
              >
                删除
              </Button>
            </Tooltip>
          ) : null}
        </Flex>
      ),
    },
  ]

  return (
    <DataTablePanel<SystemRoleDto>
      ariaLabel="角色列表"
      toolbar={
        canCreate ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={Boolean(loadingCode)}
            onClick={onCreate}
          >
            新增角色
          </Button>
        ) : undefined
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            title="角色列表加载失败"
            action={
              <Button size="small" onClick={onRetry}>
                重试
              </Button>
            }
          />
        ) : undefined
      }
      tableProps={{
        rowKey: 'code',
        columns,
        dataSource: roles,
        loading,
      }}
      scrollX={1100}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}
