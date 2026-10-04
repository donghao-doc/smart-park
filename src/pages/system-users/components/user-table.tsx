import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Tag, Tooltip, type TableColumnsType } from 'antd'
import dayjs from 'dayjs'

import DataTablePanel from '@/components/data-table-panel'
import type { UserDto } from '@/types/auth'
import { userStatusLabels } from '../user-options'
import './user-table.scss'

interface UserTableProps {
  /** 当前页用户列表 */
  users: UserDto[]
  /** 符合筛选条件的用户总数 */
  total: number
  /** 当前页码，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 是否正在请求列表 */
  loading: boolean
  /** 列表请求是否失败 */
  loadError: boolean
  /** 是否有新增用户权限 */
  canCreate: boolean
  /** 是否有修改用户权限 */
  canUpdate: boolean
  /** 是否有修改账号状态权限 */
  canChangeStatus: boolean
  /** 是否有重置密码权限 */
  canResetPassword: boolean
  /** 正在加载编辑资料的用户标识 */
  editingId?: string
  /** 打开新增表单 */
  onCreate: () => void
  /** 请求用户详情并打开编辑表单 */
  onEdit: (id: string) => void
  /** 确认后变更用户启停状态 */
  onChangeStatus: (user: UserDto) => void
  /** 确认后生成临时密码 */
  onResetPassword: (user: UserDto) => void
  /** 重新请求当前列表 */
  onRetry: () => void
  /** 切换页码或每页条数 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 用户管理表格，展示角色、启停状态和账号维护操作 */
function UserTable({
  users,
  total,
  page,
  pageSize,
  loading,
  loadError,
  canCreate,
  canUpdate,
  canChangeStatus,
  canResetPassword,
  editingId,
  onCreate,
  onEdit,
  onChangeStatus,
  onResetPassword,
  onRetry,
  onPageChange,
}: UserTableProps) {
  const columns: TableColumnsType<UserDto> = [
    {
      title: '#',
      key: 'sequence',
      width: 60,
      render: (_value, _user, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 130,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 90,
      ellipsis: true,
    },
    {
      title: '所属企业',
      key: 'enterprise',
      width: 220,
      ellipsis: true,
      render: (_value, user) => user.enterprise?.name ?? '智慧园区管理委员会',
    },
    {
      title: '角色',
      key: 'role',
      width: 155,
      render: (_value, user) => (
        <Tag className={`user-role-tag is-${user.role.code}`} variant="filled">
          {user.role.name}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 85,
      render: (_value, user) => (
        <Tag className={`user-status-tag is-${user.status}`} variant="filled">
          {userStatusLabels[user.status]}
        </Tag>
      ),
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginAt',
      width: 170,
      render: (value: string | null) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '尚未登录',
    },
    {
      title: '操作',
      key: 'actions',
      width: 215,
      fixed: 'right',
      render: (_value, user) => (
        <Flex className="user-table-actions" gap={2} align="center">
          {canUpdate ? (
            <Button
              type="link"
              loading={editingId === user.id}
              disabled={Boolean(editingId) && editingId !== user.id}
              onClick={() => onEdit(user.id)}
            >
              编辑
            </Button>
          ) : null}
          {canResetPassword ? (
            <Button type="link" onClick={() => onResetPassword(user)}>
              重置密码
            </Button>
          ) : null}
          {canChangeStatus ? (
            <Tooltip
              title={user.role.code === 'super_admin' ? '超级管理员账号不能停用' : undefined}
            >
              <Button
                type="link"
                disabled={user.role.code === 'super_admin'}
                onClick={() => onChangeStatus(user)}
              >
                {user.status === 'active' ? '停用' : '启用'}
              </Button>
            </Tooltip>
          ) : null}
        </Flex>
      ),
    },
  ]

  return (
    <DataTablePanel<UserDto>
      ariaLabel="用户列表"
      className="user-table-panel"
      toolbar={
        canCreate ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={Boolean(editingId)}
            onClick={onCreate}
          >
            新增用户
          </Button>
        ) : undefined
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            title="用户列表加载失败"
            action={
              <Button size="small" onClick={onRetry}>
                重试
              </Button>
            }
          />
        ) : undefined
      }
      tableProps={{
        rowKey: 'id',
        columns,
        dataSource: users,
        loading,
        locale: {
          emptyText: loadError ? '暂时无法获取用户数据' : '暂无符合条件的用户',
        },
      }}
      scrollX={1125}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default UserTable
