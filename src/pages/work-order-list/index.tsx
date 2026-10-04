import { Alert, App, Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  reqCreateWorkOrder,
  reqGetWorkOrderOptions,
  reqGetWorkOrders,
  reqGetWorkOrderSummary,
  reqUpdateWorkOrder,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type {
  WorkOrderAction,
  WorkOrderActionRequest,
  WorkOrderCreateRequest,
  WorkOrderDto,
  WorkOrderMetricDto,
  WorkOrderOptionsDto,
} from '@/types/work-order'
import WorkOrderActionModal from './components/work-order-action-modal'
import WorkOrderCreateModal from './components/work-order-create-modal'
import WorkOrderFilter, { type WorkOrderFilterValues } from './components/work-order-filter'
import WorkOrderSummary from './components/work-order-summary'
import WorkOrderTable from './components/work-order-table'
import './work-order-list.scss'

/** 工单中心，负责查询、创建及按角色权限执行完整处理流程 */
function WorkOrderListPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const currentUser = useUserStore((state) => state.currentUser)
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<WorkOrderDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<WorkOrderFilterValues>({})
  const [filterResetVersion, setFilterResetVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [summary, setSummary] = useState<WorkOrderMetricDto[]>()
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [options, setOptions] = useState<WorkOrderOptionsDto>()
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState(false)
  const [optionsVersion, setOptionsVersion] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionOrder, setActionOrder] = useState<WorkOrderDto>()
  const [action, setAction] = useState<WorkOrderAction>('accept')

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetWorkOrders({ ...filters, page, pageSize })
        if (active) {
          setOrders(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setOrders([])
          setTotal(0)
          setLoadError(true)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    // 筛选、分页或刷新时忽略旧响应，避免慢请求覆盖当前结果
    return () => {
      active = false
    }
  }, [filters, page, pageSize, reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetWorkOrderSummary()
        if (active) {
          setSummary(result)
          setSummaryError(false)
        }
      } catch {
        if (active) setSummaryError(true)
      } finally {
        if (active) setSummaryLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetWorkOrderOptions()
        if (active) {
          setOptions(result)
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
  }, [optionsVersion])

  const requestedCreate = searchParams.get('action') === 'create' &&
    Boolean(currentUser?.role.permissions.includes('work-order:create'))

  /** 关闭创建表单时清理快捷入口参数，避免刷新后重复打开 */
  function handleCloseCreate() {
    setCreateOpen(false)
    if (searchParams.has('action')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('action')
      setSearchParams(nextParams, { replace: true })
    }
  }

  /** 同步刷新当前列表和五项统计 */
  function handleReload() {
    setLoading(true)
    setSummaryLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 表单选项失败后允许独立重试 */
  function handleRetryOptions() {
    setOptionsLoading(true)
    setOptionsVersion((version) => version + 1)
  }

  /** 查询条件变化后回到第一页 */
  function handleSearch(values: WorkOrderFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /** 跳转至独立详情页，支持刷新和直接访问 */
  function handleView(id: string) {
    void navigate(`/work-orders/${encodeURIComponent(id)}`)
  }

  /** 创建成功后清除筛选，便于立即查看新工单 */
  async function handleCreate(payload: WorkOrderCreateRequest) {
    setSubmitting(true)
    try {
      const result = await reqCreateWorkOrder(payload)
      handleCloseCreate()
      setPage(1)
      setFilters({})
      setFilterResetVersion((version) => version + 1)
      handleReload()
      handleView(result.id)
      void message.success('工单创建成功')
    } catch {
      // 统一 HTTP 层展示接口异常，保留表单供用户修正或重试
    } finally {
      setSubmitting(false)
    }
  }

  /** 执行动作后刷新统计，失败时也刷新列表以同步可能变化的工单状态 */
  async function handleActionSubmit(payload: WorkOrderActionRequest) {
    if (!actionOrder) return
    setSubmitting(true)
    try {
      const result = await reqUpdateWorkOrder(actionOrder.id, payload)
      setActionOrder(undefined)
      handleReload()
      handleView(result.id)
      void message.success('工单操作成功')
    } catch (error) {
      // 状态冲突时关闭旧操作表单，让用户基于最新列表重新选择动作
      if (error && typeof error === 'object' && 'code' in error && error.code === 409100) {
        setActionOrder(undefined)
      }
      handleReload()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DataTablePageLayout className="work-order-list-page">
        <WorkOrderSummary
          summary={summary}
          loading={summaryLoading}
          loadError={summaryError}
          onRetry={handleReload}
        />
        <WorkOrderFilter
          key={filterResetVersion}
          enterpriseOptions={options?.enterprises.map((item) => ({ value: item.id, label: item.name }))}
          optionsLoading={optionsLoading}
          onSearch={handleSearch}
        />
        {optionsError ? (
          <Alert
            type="warning"
            showIcon
            title="企业和处理人选项加载失败"
            action={<Button size="small" onClick={handleRetryOptions}>重试</Button>}
          />
        ) : null}
        <WorkOrderTable
          orders={orders}
          currentUser={currentUser}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          onCreate={() => setCreateOpen(true)}
          onView={handleView}
          onAction={(order, nextAction) => {
            setActionOrder(order)
            setAction(nextAction)
          }}
          onReload={handleReload}
          onPageChange={(nextPage, nextSize) => {
            if (page === nextPage && pageSize === nextSize) return
            setLoading(true)
            setPage(nextPage)
            setPageSize(nextSize)
          }}
        />
      </DataTablePageLayout>
      <WorkOrderCreateModal
        open={createOpen || requestedCreate}
        options={options}
        lockedEnterpriseId={
          currentUser?.role.code === 'enterprise_user' ? currentUser.enterprise?.id : undefined
        }
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        submitting={submitting}
        onRetryOptions={handleRetryOptions}
        onSubmit={handleCreate}
        onCancel={handleCloseCreate}
      />
      <WorkOrderActionModal
        order={actionOrder}
        action={action}
        options={options}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        submitting={submitting}
        onRetryOptions={handleRetryOptions}
        onSubmit={handleActionSubmit}
        onCancel={() => setActionOrder(undefined)}
      />
    </>
  )
}

export default WorkOrderListPage
