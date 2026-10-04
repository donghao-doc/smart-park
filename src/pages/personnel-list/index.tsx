import { App, type SelectProps } from 'antd'
import { useEffect, useState } from 'react'

import {
  reqCreatePersonnel,
  reqGetEnterprises,
  reqGetPersonnel,
  reqGetPersonnelList,
  reqUpdatePersonnel,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type { PersonnelDto, PersonnelMutationRequest } from '@/types/personnel'
import PersonnelDetailModal from './components/personnel-detail-modal'
import PersonnelFilter from './components/personnel-filter'
import type { PersonnelFilterValues } from './components/personnel-filter'
import PersonnelFormModal from './components/personnel-form-modal'
import PersonnelTable from './components/personnel-table'
import './personnel-list.scss'

const DEFAULT_PAGE_SIZE = 20

/**
 * 人员管理页面，提供筛选、分页、新增、查看和编辑能力
 */
function PersonnelListPage() {
  const { message } = App.useApp()
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([])
  const [enterpriseOptions, setEnterpriseOptions] = useState<NonNullable<SelectProps['options']>>(
    [],
  )
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<PersonnelFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelDto>()
  const [viewingPersonnel, setViewingPersonnel] = useState<PersonnelDto>()
  const [submitting, setSubmitting] = useState(false)
  const canCreate = useUserStore((state) => state.hasPermission('personnel:create'))
  const canUpdate = useUserStore((state) => state.hasPermission('personnel:update'))

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetEnterprises({ page: 1, pageSize: 100 })
        if (active) {
          setEnterpriseOptions(
            result.list.map((enterprise) => ({
              label: enterprise.name,
              value: enterprise.id,
            })),
          )
        }
      } catch {
        if (active) {
          setEnterpriseOptions([])
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetPersonnelList({
          page,
          pageSize,
          name: filters.name?.trim() || undefined,
          phone: filters.phone?.trim() || undefined,
          enterpriseId: filters.enterpriseId,
          status: filters.status,
        })
        if (active) {
          setPersonnel(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setLoadError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [filters, page, pageSize, reloadVersion])

  /**
   * 加载人员详情并打开查看弹窗
   */
  async function handleOpenView(personnelId: string) {
    try {
      const detail = await reqGetPersonnel(personnelId)
      setViewingPersonnel(detail)
      setDetailOpen(true)
    } catch {
      // 接口错误由统一 HTTP 层展示
    }
  }

  /**
   * 加载人员详情并打开编辑弹窗
   */
  async function handleOpenEdit(personnelId: string) {
    try {
      const detail = await reqGetPersonnel(personnelId)
      setEditingPersonnel(detail)
      setFormOpen(true)
    } catch {
      // 接口错误由统一 HTTP 层展示
    }
  }

  /**
   * 新增或更新人员并刷新当前页数据
   */
  async function handleSubmit(values: PersonnelMutationRequest) {
    setSubmitting(true)
    try {
      if (editingPersonnel) {
        await reqUpdatePersonnel(editingPersonnel.id, values)
        void message.success('人员信息已更新')
      } else {
        await reqCreatePersonnel(values)
        setPage(1)
        void message.success('人员创建成功')
      }
      setFormOpen(false)
      setEditingPersonnel(undefined)
      setLoading(true)
      setReloadVersion((version) => version + 1)
    } catch {
      // 接口错误由统一 HTTP 层展示，弹窗保持打开便于用户修正
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 应用人员筛选条件并从第一页重新加载数据
   */
  function handleFilterSearch(values: PersonnelFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /**
   * 同步分页器状态，改变每页条数时回到第一页
   */
  function handlePageChange(nextPage: number, nextPageSize: number) {
    setLoading(true)
    setPageSize(nextPageSize)
    setPage(nextPage)
  }

  return (
    <>
      <DataTablePageLayout className="personnel-page">
        <PersonnelFilter enterpriseOptions={enterpriseOptions} onSearch={handleFilterSearch} />

        <PersonnelTable
          personnel={personnel}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          canCreate={canCreate}
          canUpdate={canUpdate}
          onCreate={() => {
            setEditingPersonnel(undefined)
            setFormOpen(true)
          }}
          onView={(personnelId) => void handleOpenView(personnelId)}
          onEdit={(personnelId) => void handleOpenEdit(personnelId)}
          onRetry={() => {
            setLoading(true)
            setReloadVersion((version) => version + 1)
          }}
          onPageChange={handlePageChange}
        />
      </DataTablePageLayout>

      <PersonnelFormModal
        open={formOpen}
        personnel={editingPersonnel}
        enterpriseOptions={enterpriseOptions}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={() => {
          setFormOpen(false)
          setEditingPersonnel(undefined)
        }}
      />

      <PersonnelDetailModal
        open={detailOpen}
        personnel={viewingPersonnel}
        onClose={() => {
          setDetailOpen(false)
          setViewingPersonnel(undefined)
        }}
      />
    </>
  )
}

export default PersonnelListPage
