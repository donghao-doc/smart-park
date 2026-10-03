import { App } from 'antd'
import { useEffect, useState } from 'react'

import {
  reqCreateEnterprise,
  reqGetEnterprise,
  reqGetEnterprises,
  reqUpdateEnterprise,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type {
  EnterpriseDetailDto,
  EnterpriseListItemDto,
  EnterpriseMutationRequest,
} from '@/types/enterprise'
import EnterpriseFilter from './components/enterprise-filter'
import type { EnterpriseFilterValues } from './components/enterprise-filter'
import EnterpriseFormModal from './components/enterprise-form-modal'
import EnterpriseTable from './components/enterprise-table'

const DEFAULT_PAGE_SIZE = 20

/**
 * 企业管理页面，提供筛选、分页、新增、查看和编辑入口
 */
function EnterpriseListPage() {
  const { message } = App.useApp()
  const [enterprises, setEnterprises] = useState<EnterpriseListItemDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<EnterpriseFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEnterprise, setEditingEnterprise] = useState<EnterpriseDetailDto>()
  const [submitting, setSubmitting] = useState(false)
  const canCreate = useUserStore((state) => state.hasPermission('enterprise:create'))
  const canUpdate = useUserStore((state) => state.hasPermission('enterprise:update'))

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetEnterprises({
          page,
          pageSize,
          keyword: filters.keyword?.trim() || undefined,
          status: filters.status,
        })
        if (active) {
          setEnterprises(result.list)
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
   * 打开编辑弹窗前加载完整企业详情
   */
  async function handleOpenEdit(enterpriseId: string) {
    try {
      const detail = await reqGetEnterprise(enterpriseId)
      setEditingEnterprise(detail)
      setFormOpen(true)
    } catch {
      // 接口错误由统一 HTTP 层展示
    }
  }

  /**
   * 新增或更新企业并刷新当前页数据
   */
  async function handleSubmit(values: EnterpriseMutationRequest) {
    setSubmitting(true)
    try {
      if (editingEnterprise) {
        await reqUpdateEnterprise(editingEnterprise.id, values)
        void message.success('企业信息已更新')
      } else {
        await reqCreateEnterprise(values)
        setPage(1)
        void message.success('企业创建成功')
      }
      setFormOpen(false)
      setEditingEnterprise(undefined)
      setLoading(true)
      setReloadVersion((version) => version + 1)
    } catch {
      // 接口错误由统一 HTTP 层展示，弹窗保持打开便于用户修正
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 同步分页器状态，改变每页条数时回到第一页
   */
  function handlePageChange(nextPage: number, nextPageSize: number) {
    setLoading(true)
    setPageSize(nextPageSize)
    setPage(nextPage)
  }

  /**
   * 应用企业筛选条件并从第一页重新加载数据
   */
  function handleFilterSearch(values: EnterpriseFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /**
   * 打开新增企业弹窗
   */
  function handleOpenCreate() {
    setEditingEnterprise(undefined)
    setFormOpen(true)
  }

  /**
   * 重新加载当前页企业列表
   */
  function handleRetry() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  return (
    <>
      <DataTablePageLayout>
        {/* 企业筛选 */}
        <EnterpriseFilter onSearch={handleFilterSearch} />

        {/* 企业列表 */}
        <EnterpriseTable
          enterprises={enterprises}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          canCreate={canCreate}
          canUpdate={canUpdate}
          onCreate={handleOpenCreate}
          onEdit={(enterpriseId) => void handleOpenEdit(enterpriseId)}
          onRetry={handleRetry}
          onPageChange={handlePageChange}
        />
      </DataTablePageLayout>

      {/* 企业新增、编辑弹窗 */}
      <EnterpriseFormModal
        open={formOpen}
        enterprise={editingEnterprise}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={() => {
          setFormOpen(false)
          setEditingEnterprise(undefined)
        }}
      />
    </>
  )
}

export default EnterpriseListPage
