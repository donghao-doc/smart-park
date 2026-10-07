import { App } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  reqCreateRole,
  reqDeleteRole,
  reqGetPermissionCatalog,
  reqGetRole,
  reqGetRoleList,
  reqUpdateRole,
  reqUpdateRolePermissions,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import RolePermissionModal from '@/components/role-permission-modal'
import { useUserStore } from '@/stores/user'
import type { PermissionCode } from '@/types/auth'
import type { PermissionNodeDto, SystemRoleDto } from '@/types/system-role'
import RoleFilter, { type RoleFilterValues } from './components/role-filter'
import RoleFormModal, { type RoleFormValues } from './components/role-form-modal'
import RoleTable from './components/role-table'

/** 角色管理页面，维护角色基本资料、权限配置和用户分配关系入口 */
export default function SystemRolesPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const currentPermissions = useUserStore((state) => state.currentUser?.role.permissions)
  const canCreate = currentPermissions?.includes('system-role:create') ?? false
  const canUpdate = currentPermissions?.includes('system-role:update') ?? false
  const canGrant = currentPermissions?.includes('system-role:grant') ?? false
  const canDelete = currentPermissions?.includes('system-role:delete') ?? false
  const canViewUsers = currentPermissions?.includes('system-user:view') ?? false
  const [roles, setRoles] = useState<SystemRoleDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<RoleFilterValues>({})
  const [reloadVersion, setReloadVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadingCode, setLoadingCode] = useState<string>()
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'copy'>('create')
  const [selectedRole, setSelectedRole] = useState<SystemRoleDto>()
  const [permissionRole, setPermissionRole] = useState<SystemRoleDto>()
  const [permissionNodes, setPermissionNodes] = useState<PermissionNodeDto[]>([])
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    let correctedPage = false
    void (async () => {
      setLoading(true)
      try {
        const result = await reqGetRoleList({
          ...filters,
          keyword: filters.keyword?.trim() || undefined,
          page,
          pageSize,
        })
        if (!active) return
        const lastPage = Math.max(1, Math.ceil(result.total / pageSize))
        if (page > lastPage) {
          correctedPage = true
          setPage(lastPage)
          return
        }
        setRoles(result.list)
        setTotal(result.total)
        setLoadError(false)
      } catch {
        if (active) {
          setRoles([])
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

  /** 在当前筛选条件下重新加载列表 */
  function handleReload() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 编辑和复制前查询最新资料，失败时不打开表单 */
  async function handleEdit(role: SystemRoleDto, copy: boolean) {
    if (loadingCode) return
    setLoadingCode(role.code)
    try {
      setSelectedRole(await reqGetRole(role.code))
      setFormMode(copy ? 'copy' : 'edit')
      setFormOpen(true)
    } catch {
      // 详情加载失败由统一 HTTP 层提示
    } finally {
      setLoadingCode(undefined)
    }
  }

  /** 新增、编辑或复制角色，失败时保留用户输入 */
  async function handleSubmit(values: RoleFormValues) {
    if (submitting) return
    setSubmitting(true)
    try {
      const fields = { name: values.name.trim(), description: values.description.trim() }
      if (formMode === 'edit' && selectedRole) {
        await reqUpdateRole(selectedRole.code, fields)
      } else {
        await reqCreateRole({
          ...fields,
          code: values.code.trim(),
          permissions: formMode === 'copy' ? (selectedRole?.permissions ?? []) : [],
        })
        setPage(1)
      }
      setFormOpen(false)
      void message.success(formMode === 'edit' ? '角色已更新' : '角色创建成功')
      handleReload()
    } catch {
      // 保存失败时保留弹窗，接口错误由统一 HTTP 层提示
    } finally {
      setSubmitting(false)
    }
  }

  /** 同时加载最新角色与完整目录，避免将当前账号的菜单误用为可配置目录 */
  async function handlePermissions(role: SystemRoleDto) {
    if (loadingCode) return
    setLoadingCode(role.code)
    try {
      const [latestRole, nodes] = await Promise.all([
        reqGetRole(role.code),
        reqGetPermissionCatalog(),
      ])
      setPermissionRole(latestRole)
      setPermissionNodes(nodes)
      setPermissionOpen(true)
    } catch {
      // 加载失败时保持列表可操作，不打开不完整的权限表单
    } finally {
      setLoadingCode(undefined)
    }
  }

  /** 保存完整权限集合，接口层通知已登录页面同步访问权限 */
  async function handleSavePermissions(permissions: PermissionCode[]) {
    if (!permissionRole || submitting) return
    setSubmitting(true)
    try {
      await reqUpdateRolePermissions(permissionRole.code, { permissions })
      setPermissionOpen(false)
      void message.success('角色权限已保存')
      handleReload()
    } catch {
      // 授权失败时保留勾选结果，统一 HTTP 层提示错误
    } finally {
      setSubmitting(false)
    }
  }

  /** 删除前确认影响范围，接口再次校验是否存在关联用户 */
  function handleDelete(role: SystemRoleDto) {
    const confirmation = modal.confirm({
      title: `确认删除角色「${role.name}」？`,
      content: '删除后无法恢复，已关联用户的角色需要先调整用户分配关系',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await reqDeleteRole(role.code)
          void message.success('角色已删除')
          handleReload()
        } catch (error) {
          confirmation.update({ title: '删除未完成，请重试或取消' })
          throw error
        }
      },
    })
  }

  return (
    <>
      <DataTablePageLayout>
        <RoleFilter
          onSearch={(values) => {
            setPage(1)
            setFilters(values)
          }}
        />
        <RoleTable
          roles={roles}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          loadingCode={loadingCode}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canGrant={canGrant}
          canDelete={canDelete}
          canViewUsers={canViewUsers}
          onCreate={() => {
            setSelectedRole(undefined)
            setFormMode('create')
            setFormOpen(true)
          }}
          onEdit={(role, copy) => void handleEdit(role, copy)}
          onPermissions={(role) => void handlePermissions(role)}
          onDelete={handleDelete}
          onViewUsers={(role) =>
            void navigate(`/system/users?roleCode=${encodeURIComponent(role.code)}`)
          }
          onRetry={handleReload}
          onPageChange={(nextPage, nextSize) => {
            setPage(nextPage)
            setPageSize(nextSize)
          }}
        />
      </DataTablePageLayout>
      <RoleFormModal
        open={formOpen}
        mode={formMode}
        role={selectedRole}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={() => {
          if (!submitting) setFormOpen(false)
        }}
      />
      <RolePermissionModal
        key={`${permissionRole?.code}:${permissionOpen}`}
        open={permissionOpen}
        role={permissionRole}
        nodes={permissionNodes}
        readOnly={!canGrant || permissionRole?.code === 'super_admin'}
        grantablePermissions={currentPermissions}
        submitting={submitting}
        onSave={(permissions) => void handleSavePermissions(permissions)}
        onCancel={() => {
          if (!submitting) setPermissionOpen(false)
        }}
      />
    </>
  )
}
