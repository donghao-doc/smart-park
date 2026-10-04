import { useEffect, useState } from 'react'

import { reqGetParkingRecord, reqGetParkingRecords, reqGetParkingRecordSummary } from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import type { ParkingRecordDto, ParkingRecordSummaryDto } from '@/types/parking-record'
import ParkingDetailModal from './components/parking-detail-modal'
import ParkingFilter, { type ParkingFilterValues } from './components/parking-filter'
import ParkingSummary from './components/parking-summary'
import ParkingTable from './components/parking-table'
import './parking-records.scss'

const DEFAULT_PAGE_SIZE = 20

/** 停车记录页面，负责只读通行查询、统计和详情数据加载 */
function ParkingRecordsPage() {
  const [records, setRecords] = useState<ParkingRecordDto[]>([])
  const [summary, setSummary] = useState<ParkingRecordSummaryDto>()
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<ParkingFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<ParkingRecordDto>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetParkingRecords({ ...filters, page, pageSize })
        if (active) {
          setRecords(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setRecords([])
          setTotal(0)
          setLoadError(true)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    // 筛选、翻页和刷新后忽略旧请求，避免慢响应覆盖最新结果
    return () => {
      active = false
    }
  }, [filters, page, pageSize, reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetParkingRecordSummary()
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
    if (!selectedId) return
    let active = true
    void (async () => {
      try {
        const result = await reqGetParkingRecord(selectedId)
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
    // 关闭或切换详情时，不再应用已失效的请求结果
    return () => {
      active = false
    }
  }, [selectedId, detailVersion])

  /** 刷新当前页及停车统计 */
  function handleReload() {
    setLoading(true)
    setSummaryLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 更新查询条件并回到第一页 */
  function handleSearch(values: ParkingFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /** 打开详情时清理上一条记录 */
  function handleView(recordId: string) {
    setDetail(undefined)
    setDetailError(false)
    setDetailLoading(true)
    setSelectedId(recordId)
  }

  return (
    <>
      <DataTablePageLayout className="parking-records-page">
        <header className="parking-page-heading">
          <h1>停车记录</h1>
          <p>记录园区车辆进出情况，支持多维度查询与管理</p>
        </header>
        <ParkingSummary
          summary={summary}
          loading={summaryLoading}
          loadError={summaryError}
          onRetry={handleReload}
        />
        <ParkingFilter onSearch={handleSearch} />
        <ParkingTable
          records={records}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          onView={handleView}
          onReload={handleReload}
          onPageChange={(nextPage, nextPageSize) => {
            if (page === nextPage && pageSize === nextPageSize) return
            setLoading(true)
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      </DataTablePageLayout>
      <ParkingDetailModal
        open={Boolean(selectedId)}
        record={detail}
        loading={detailLoading}
        loadError={detailError}
        onRetry={() => {
          setDetailLoading(true)
          setDetailVersion((version) => version + 1)
        }}
        onClose={() => setSelectedId(undefined)}
      />
    </>
  )
}

export default ParkingRecordsPage
