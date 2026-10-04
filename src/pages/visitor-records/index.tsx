import { useEffect, useState } from 'react'
import type { SelectProps } from 'antd'

import {
  reqGetEnterprises,
  reqGetVisitorRecord,
  reqGetVisitorRecords,
  reqGetVisitorRecordSummary,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type { VisitorRecordDto, VisitorRecordSummaryDto } from '@/types/visitor-record'
import RecordDetailModal from './components/record-detail-modal'
import RecordFilter, { type RecordFilterValues } from './components/record-filter'
import RecordSummary from './components/record-summary'
import RecordTable from './components/record-table'
import './visitor-records.scss'

const DEFAULT_PAGE_SIZE = 20

/** 到访记录页面，负责只读历史查询、统计和详情数据加载 */
function VisitorRecordsPage() {
  const currentUser = useUserStore((state) => state.currentUser)
  const enterpriseLocked = currentUser?.role.code === 'enterprise_user'
  const defaultEnterpriseId = currentUser?.enterprise?.id
  const [enterpriseOptions, setEnterpriseOptions] = useState<NonNullable<SelectProps['options']>>([])
  const [records, setRecords] = useState<VisitorRecordDto[]>([])
  const [summary, setSummary] = useState<VisitorRecordSummaryDto>()
  const [summaryError, setSummaryError] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<RecordFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<VisitorRecordDto>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetEnterprises({ page: 1, pageSize: 100 })
        if (active) {
          setEnterpriseOptions(
            result.list.map((item) => ({ label: item.name, value: item.id })),
          )
        }
      } catch {
        // 企业用户仍可展示所属企业，其余接口错误由统一 HTTP 层反馈
        if (active) setEnterpriseOptions([])
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
        const result = await reqGetVisitorRecords({
          ...filters,
          page,
          pageSize,
          enterpriseId: enterpriseLocked ? defaultEnterpriseId : filters.enterpriseId,
        })
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
    return () => {
      active = false
    }
  }, [defaultEnterpriseId, enterpriseLocked, filters, page, pageSize, reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetVisitorRecordSummary()
        if (active) {
          setSummary(result)
          setSummaryError(false)
        }
      } catch {
        if (active) setSummaryError(true)
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
        const result = await reqGetVisitorRecord(selectedId)
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
    // 关闭弹窗或切换记录后忽略旧请求，避免详情被过期响应覆盖
    return () => {
      active = false
    }
  }, [selectedId, detailVersion])

  /** 刷新列表和当前账号的今日统计 */
  function handleReload() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 提交筛选时回到第一页 */
  function handleSearch(values: RecordFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /** 打开详情并清理上一条记录，防止加载时显示旧数据 */
  function handleView(recordId: string) {
    setDetail(undefined)
    setDetailError(false)
    setDetailLoading(true)
    setSelectedId(recordId)
  }

  const visibleEnterpriseOptions = enterpriseLocked && currentUser?.enterprise
    ? [{ label: currentUser.enterprise.name, value: currentUser.enterprise.id }]
    : enterpriseOptions

  return (
    <>
      <DataTablePageLayout className="visitor-records-page">
        <RecordSummary summary={summary} loadError={summaryError} onRetry={handleReload} />
        <RecordFilter
          enterpriseOptions={visibleEnterpriseOptions}
          enterpriseLocked={enterpriseLocked}
          defaultEnterpriseId={defaultEnterpriseId}
          onSearch={handleSearch}
        />
        <RecordTable
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
      <RecordDetailModal
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

export default VisitorRecordsPage
