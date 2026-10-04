import { useCallback, useEffect, useState } from 'react'

import { reqGetOperationLog, reqGetOperationLogs } from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import type { OperationLogDetailDto, OperationLogDto } from '@/types/operation-log'
import OperationLogDetailDrawer from './components/operation-log-detail-drawer'
import OperationLogFilter, { type OperationLogFilterValues } from './components/operation-log-filter'
import OperationLogTable from './components/operation-log-table'
import './operation-logs.scss'

/** 操作日志页面，负责审计记录筛选、分页和独立详情请求 */
function OperationLogsPage() {
  const [logs, setLogs] = useState<OperationLogDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<OperationLogFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<OperationLogDetailDto>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetOperationLogs({ ...filters, page, pageSize })
        if (active) {
          setLogs(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setLogs([])
          setTotal(0)
          setLoadError(true)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    // 快速切换筛选或分页时，旧响应不得覆盖新的查询结果
    return () => { active = false }
  }, [filters, page, pageSize, reloadVersion])

  useEffect(() => {
    if (!selectedId) return
    let active = true
    void (async () => {
      try {
        const result = await reqGetOperationLog(selectedId)
        if (active) {
          setDetail(result)
          setDetailError(false)
        }
      } catch {
        if (active) setDetailError(true)
      } finally {
        if (active) setDetailLoading(false)
      }
    })()
    // 关闭抽屉或切换记录后，忽略仍在途中的旧详情响应
    return () => { active = false }
  }, [selectedId, detailVersion])

  /** 应用筛选并从第一页重新查询 */
  function handleSearch(values: OperationLogFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
    setSelectedId(undefined)
  }

  /** 重试当前筛选和分页条件 */
  function handleReload() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 打开指定日志，先清除上一条详情以避免内容闪回 */
  const handleView = useCallback((id: string) => {
    if (id === selectedId) return
    setDetail(undefined)
    setDetailError(false)
    setDetailLoading(true)
    setSelectedId(id)
  }, [selectedId])

  /** 详情失败时保留抽屉并重新读取 */
  function handleRetryDetail() {
    setDetailLoading(true)
    setDetailError(false)
    setDetailVersion((version) => version + 1)
  }

  return (
    <>
      <DataTablePageLayout className="operation-logs-page">
        <OperationLogFilter onSearch={handleSearch} />
        <OperationLogTable
          logs={logs}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          selectedId={selectedId}
          onView={handleView}
          onRetry={handleReload}
          onPageChange={(nextPage, nextPageSize) => {
            if (page === nextPage && pageSize === nextPageSize) return
            setLoading(true)
            setPage(nextPage)
            setPageSize(nextPageSize)
            setSelectedId(undefined)
          }}
        />
      </DataTablePageLayout>
      <OperationLogDetailDrawer
        open={Boolean(selectedId)}
        log={detail}
        loading={detailLoading}
        loadError={detailError}
        onRetry={handleRetryDetail}
        onClose={() => setSelectedId(undefined)}
      />
    </>
  )
}

export default OperationLogsPage
