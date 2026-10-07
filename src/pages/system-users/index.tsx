import { App, Flex, Typography, type SelectProps } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  reqCreateUser,
  reqAssignUserRole,
  reqGetUserEnterpriseOptions,
  reqGetRoles,
  reqGetPermissionCatalog,
  reqGetUser,
  reqGetUsers,
  reqResetUserPassword,
  reqUpdateUser,
  reqUpdateUserStatus,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import RolePermissionModal from '@/components/role-permission-modal'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import type { UserDto } from '@/types/auth'
import type { PermissionNodeDto } from '@/types/system-role'
import UserFilter, { type UserFilterValues } from './components/user-filter'
import UserFormModal, { type UserFormValues } from './components/user-form-modal'
import UserTable from './components/user-table'

interface SystemUsersPageProps {
  /** 从角色管理或查询参数传入的初始角色筛选条件 */
  initialRoleCode?: string
}

/** 用户管理页面，负责账号维护、角色分配和生效权限查看 */
function SystemUsersPage({ initialRoleCode }: SystemUsersPageProps) {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const currentUser = useUserStore((state) => state.currentUser)
  const canAssignRole = useUserStore((state) => state.hasPermission('system-user:assign-role'))
  const canManageRoles = useUserStore((state) => state.hasPermission('system-role:view'))
  const canCreate =
    useUserStore((state) => state.hasPermission('system-user:create')) && canAssignRole
  const canUpdate = useUserStore((state) => state.hasPermission('system-user:update'))
  const canChangeStatus = useUserStore((state) => state.hasPermission('system-user:status'))
  const canResetPassword = useUserStore((state) =>
    state.hasPermission('system-user:reset-password'),
  )
  const [users, setUsers] = useState<UserDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<UserFilterValues>({ roleCode: initialRoleCode })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [roleOnly, setRoleOnly] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDto>()
  const [editingId, setEditingId] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [roleOptions, setRoleOptions] = useState<SelectProps['options']>([])
  const [enterpriseOptions, setEnterpriseOptions] = useState<SelectProps['options']>([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState(false)
  const [optionsVersion, setOptionsVersion] = useState(0)
  const [permissionUser, setPermissionUser] = useState<UserDto>()
  const [permissionNodes, setPermissionNodes] = useState<PermissionNodeDto[]>([])
  const [viewingPermissionsId, setViewingPermissionsId] = useState<string>()
  const [roleOptionsError, setRoleOptionsError] = useState(false)
  const [assignableRoleOptions, setAssignableRoleOptions] = useState<SelectProps['options']>([])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const roles = await reqGetRoles()
        if (active) {
          setRoleOptions(roles.map((role) => ({ value: role.code, label: role.name })))
          setRoleOptionsError(false)
        }
      } catch {
        if (active) setRoleOptionsError(true)
      }
    })()
    return () => {
      active = false
    }
  }, [reloadVersion, optionsVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      let correctedPage = false
      try {
        const result = await reqGetUsers({
          ...filters,
          username: filters.username?.trim() || undefined,
          name: filters.name?.trim() || undefined,
          page,
          pageSize,
        })
        if (active) {
          // 资料或状态变化可能使当前页越界，回到最后一个有效页继续加载
          const lastPage = Math.max(1, Math.ceil(result.total / pageSize))
          if (page > lastPage) {
            correctedPage = true
            setPage(lastPage)
            return
          }
          setUsers(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setUsers([])
          setTotal(0)
          setLoadError(true)
        }
      } finally {
        if (active && !correctedPage) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [filters, page, pageSize, reloadVersion])

  useEffect(() => {
    if (!formOpen) return
    let active = true
    void (async () => {
      try {
        const [roles, enterprises] = await Promise.all([
          reqGetRoles(),
          reqGetUserEnterpriseOptions(),
        ])
        if (active) {
          setRoleOptions(roles.map((role) => ({ value: role.code, label: role.name })))
          setAssignableRoleOptions(
            roles.map((role) => ({
              value: role.code,
              label: role.name,
              disabled:
                (role.code === 'super_admin' && currentUser?.role.code !== 'super_admin') ||
                role.permissions.some(
                  (permission) => !currentUser?.role.permissions.includes(permission),
                ),
            })),
          )
          setEnterpriseOptions(
            enterprises.map((enterprise) => ({
              value: enterprise.id,
              label: enterprise.disabled ? `${enterprise.name}（已停用）` : enterprise.name,
              disabled: enterprise.disabled,
            })),
          )
          setOptionsError(false)
        }
      } catch {
        if (active) setOptionsError(true)
      } finally {
        if (active) setOptionsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [formOpen, optionsVersion, currentUser])

  /** 重新加载当前筛选条件下的列表 */
  function handleReload() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 应用筛选条件并从第一页查询 */
  function handleSearch(values: UserFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /** 打开表单前加载最新用户详情，避免以过期资料覆盖账号设置 */
  async function handleEdit(id: string, assignRole = false) {
    if (editingId) return
    setEditingId(id)
    try {
      const user = await reqGetUser(id)
      setEditingUser(user)
      setRoleOnly(assignRole)
      setOptionsLoading(true)
      setOptionsError(false)
      setFormOpen(true)
    } catch {
      // 详情请求失败时不打开表单，统一 HTTP 层展示错误
    } finally {
      setEditingId(undefined)
    }
  }

  /** 查看最新用户的角色权限，失败时不展示过期或不完整的配置 */
  async function handleViewPermissions(id: string) {
    if (viewingPermissionsId) return
    setViewingPermissionsId(id)
    try {
      const [user, nodes] = await Promise.all([reqGetUser(id), reqGetPermissionCatalog()])
      setPermissionUser(user)
      setPermissionNodes(nodes)
    } catch {
      // 加载失败由统一 HTTP 层展示错误
    } finally {
      setViewingPermissionsId(undefined)
    }
  }

  /** 保存用户资料，失败时保留表单供用户修正 */
  async function handleSubmit(values: UserFormValues) {
    if (submitting) return
    const payload = {
      username: values.username.trim(),
      name: values.name.trim(),
      roleCode: values.roleCode,
      enterpriseId: values.roleCode === 'enterprise_user' ? values.enterpriseId : undefined,
    }
    setSubmitting(true)
    try {
      if (editingUser) {
        const updatedUser = roleOnly
          ? await reqAssignUserRole(editingUser.id, {
              roleCode: payload.roleCode,
              enterpriseId: payload.enterpriseId,
            })
          : await reqUpdateUser(editingUser.id, payload)
        // 同步当前账号的姓名和角色信息，保持顶部用户菜单与服务端一致
        if (updatedUser.id === currentUser?.id) {
          useUserStore.setState({ currentUser: updatedUser })
        }
        void message.success(roleOnly ? '用户角色已更新' : '用户信息已更新')
      } else {
        if (!values.password) return
        await reqCreateUser({ ...payload, password: values.password })
        setPage(1)
        void message.success('用户创建成功')
      }
      setFormOpen(false)
      handleReload()
    } catch {
      // 统一 HTTP 层展示接口错误，保留弹窗和用户输入
    } finally {
      setSubmitting(false)
    }
  }

  /** 确认后变更账号状态，停用会使目标账号的现有会话失效 */
  function handleChangeStatus(user: UserDto) {
    const status = user.status === 'active' ? 'disabled' : 'active'
    const action = status === 'active' ? '启用' : '停用'
    const confirmation = modal.confirm({
      title: `确认${action}用户「${user.username}」？`,
      content:
        status === 'disabled'
          ? '停用后该用户将无法登录，现有登录会话也会失效'
          : '启用后该用户可使用原密码重新登录',
      okText: `确认${action}`,
      cancelText: '取消',
      okButtonProps: { danger: status === 'disabled' },
      onOk: async () => {
        try {
          await reqUpdateUserStatus(user.id, { status })
          void message.success(`用户已${action}`)
          handleReload()
        } catch (error) {
          // 保持确认框打开，接口错误由统一 HTTP 层展示
          confirmation.update({ title: `${action}未完成，请重试或取消` })
          throw error
        }
      },
    })
  }

  /** 重置密码后显示仅返回一次的临时密码，当前账号需重新登录 */
  function handleResetPassword(user: UserDto) {
    const isCurrentUser = user.id === currentUser?.id
    const confirmation = modal.confirm({
      title: `确认重置「${user.username}」的密码？`,
      content: isCurrentUser
        ? '重置后当前登录会话将失效，请保存临时密码并重新登录'
        : '重置后原密码不可使用，该用户的现有登录会话将失效',
      okText: '重置密码',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await reqResetUserPassword(user.id)
          modal.success({
            title: '密码重置成功',
            content: (
              <Flex vertical gap={12}>
                <span>用户：{user.username}</span>
                <Typography.Text code copyable>
                  {result.temporaryPassword}
                </Typography.Text>
                <span>{result.message}，请妥善保存本次显示的临时密码</span>
              </Flex>
            ),
            okText: '我已保存',
          })
          if (isCurrentUser) {
            useAuthStore.getState().clearSession()
            void navigate('/login')
          } else {
            handleReload()
          }
        } catch (error) {
          // 重置失败时保留确认框，避免误提示密码已生成
          confirmation.update({ title: '密码重置未完成，请重试或取消' })
          throw error
        }
      },
    })
  }

  return (
    <>
      <DataTablePageLayout className="system-users-page">
        <UserFilter
          onSearch={handleSearch}
          initialRoleCode={initialRoleCode}
          roleOptions={roleOptions}
          rolesError={roleOptionsError}
          onRetryRoles={() => setOptionsVersion((version) => version + 1)}
        />
        <UserTable
          users={users}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canAssignRole={canAssignRole}
          onAssignRole={(id) => void handleEdit(id, true)}
          canChangeStatus={canChangeStatus}
          canResetPassword={canResetPassword}
          editingId={editingId}
          viewingPermissionsId={viewingPermissionsId}
          onViewPermissions={(id) => void handleViewPermissions(id)}
          onCreate={() => {
            setRoleOnly(false)
            setEditingUser(undefined)
            setOptionsLoading(true)
            setOptionsError(false)
            setFormOpen(true)
          }}
          onEdit={(id) => void handleEdit(id)}
          onChangeStatus={handleChangeStatus}
          onResetPassword={handleResetPassword}
          onRetry={handleReload}
          onPageChange={(nextPage, nextPageSize) => {
            if (page === nextPage && pageSize === nextPageSize) return
            setLoading(true)
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      </DataTablePageLayout>
      <RolePermissionModal
        key={permissionUser?.id ?? 'closed'}
        open={Boolean(permissionUser)}
        role={permissionUser?.role}
        nodes={permissionNodes}
        title={`${permissionUser?.username ?? ''} 的生效权限`}
        readOnly
        onManageRoles={canManageRoles ? () => void navigate('/system/roles') : undefined}
        onCancel={() => setPermissionUser(undefined)}
      />
      <UserFormModal
        open={formOpen}
        user={editingUser}
        roleOnly={roleOnly}
        roleOptions={assignableRoleOptions}
        enterpriseOptions={enterpriseOptions}
        canAssignRole={canAssignRole}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onRetryOptions={() => {
          setOptionsLoading(true)
          setOptionsVersion((version) => version + 1)
        }}
        onCancel={() => {
          if (!submitting) setFormOpen(false)
        }}
      />
    </>
  )
}

/** 按角色查询参数初始化独立列表，角色管理跳转或历史导航时同步筛选表单 */
export default function SystemUsersRoute() {
  const [params] = useSearchParams()
  const roleCode = params.get('roleCode') ?? undefined
  return <SystemUsersPage key={roleCode ?? 'all'} initialRoleCode={roleCode} />
}
