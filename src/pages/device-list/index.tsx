import { App } from 'antd'
import { useEffect, useState, type Key } from 'react'

import {
  reqCreateDevice,
  reqGetDevice,
  reqGetDeviceLocations,
  reqGetDevices,
  reqGetDeviceSummary,
  reqUpdateDevice,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type { DeviceDetailDto, DeviceDto, DeviceMutationRequest, DeviceSummaryDto } from '@/types/device'
import DeviceDetailModal from './components/device-detail-modal'
import DeviceFilter, { type DeviceFilterValues } from './components/device-filter'
import DeviceFormModal from './components/device-form-modal'
import DeviceSummary from './components/device-summary'
import DeviceTable from './components/device-table'
import './device-list.scss'

/** 设备档案弹窗的业务模式 */
type DialogMode = 'create' | 'edit' | 'view'

/** 设备管理页面，负责分页筛选、统计、档案维护及状态记录查询 */
function DeviceListPage() {
  const { message } = App.useApp()
  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<DeviceFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [summary, setSummary] = useState<DeviceSummaryDto>()
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(false)
  const [locations, setLocations] = useState<string[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [locationsError, setLocationsError] = useState(false)
  const [locationsVersion, setLocationsVersion] = useState(0)
  const [dialogMode, setDialogMode] = useState<DialogMode>()
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<DeviceDetailDto>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const canCreate = useUserStore((state) => state.hasPermission('device:create'))
  const canUpdate = useUserStore((state) => state.hasPermission('device:update'))
  const canChangeStatus = useUserStore((state) => state.hasPermission('device:status'))

  useEffect(() => {
    let active = true
    void (async () => {
      let correctedPage = false
      try {
        const result = await reqGetDevices({ ...filters, page, pageSize })
        if (active) {
          // 编辑可能使当前页超出筛选结果范围，自动回到最后一个有效页
          const lastPage = Math.max(1, Math.ceil(result.total / pageSize))
          if (page > lastPage) {
            correctedPage = true
            setPage(lastPage)
            return
          }
          setDevices(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setDevices([])
          setTotal(0)
          setLoadError(true)
        }
      } finally {
        if (active && !correctedPage) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [filters, page, pageSize, reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetDeviceSummary()
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
    return () => { active = false }
  }, [reloadVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetDeviceLocations()
        if (active) {
          setLocations(result)
          setLocationsError(false)
        }
      } catch {
        if (active) setLocationsError(true)
      } finally {
        if (active) setLocationsLoading(false)
      }
    })()
    return () => { active = false }
  }, [locationsVersion, reloadVersion])

  useEffect(() => {
    if (!selectedId || (dialogMode !== 'edit' && dialogMode !== 'view')) return
    let active = true
    void (async () => {
      try {
        const result = await reqGetDevice(selectedId)
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
    // 关闭或切换设备时忽略旧响应，避免详情覆盖或错误回填
    return () => { active = false }
  }, [detailVersion, dialogMode, selectedId])

  /** 刷新设备列表、统计及位置选项，清空可能过期的勾选 */
  function handleReload() {
    setLoading(true)
    setSummaryLoading(true)
    setLocationsLoading(true)
    setSelectedKeys([])
    setReloadVersion((version) => version + 1)
  }

  /** 应用查询条件并回到第一页 */
  function handleSearch(values: DeviceFilterValues) {
    setLoading(true)
    setSelectedKeys([])
    setPage(1)
    setFilters(values)
  }

  /** 打开设备弹窗，清除上一条档案的详情 */
  function handleOpenDialog(mode: DialogMode, id?: string) {
    setDetail(undefined)
    setDetailError(false)
    setDetailLoading(mode !== 'create')
    setSelectedId(id)
    setDialogMode(mode)
  }

  /** 保存设备，失败时保留表单供用户修正 */
  async function handleSubmit(values: DeviceMutationRequest) {
    if (submitting || (dialogMode === 'edit' && !detail)) return
    setSubmitting(true)
    try {
      if (dialogMode === 'edit' && detail) {
        await reqUpdateDevice(detail.id, values)
        void message.success('设备档案已更新')
      } else {
        await reqCreateDevice(values)
        setPage(1)
        void message.success('设备登记成功')
      }
      setDialogMode(undefined)
      setSelectedId(undefined)
      handleReload()
    } catch {
      // 统一 HTTP 层展示接口错误，弹窗与用户输入保持不变
    } finally {
      setSubmitting(false)
    }
  }

  /** 重试当前设备详情 */
  function handleRetryDetail() {
    setDetailLoading(true)
    setDetailError(false)
    setDetailVersion((version) => version + 1)
  }

  /** 关闭弹窗并取消关注未完成的详情请求 */
  function handleCloseDialog() {
    if (submitting) return
    setDialogMode(undefined)
    setSelectedId(undefined)
  }

  return (
    <>
      <DataTablePageLayout className="device-page">
        <DeviceSummary
          summary={summary}
          loading={summaryLoading}
          loadError={summaryError}
          onRetry={handleReload}
        />
        <DeviceFilter
          locations={locations}
          locationsLoading={locationsLoading}
          locationsError={locationsError}
          onRetryLocations={() => {
            setLocationsLoading(true)
            setLocationsVersion((version) => version + 1)
          }}
          onSearch={handleSearch}
        />
        <DeviceTable
          devices={devices}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          canCreate={canCreate}
          canUpdate={canUpdate}
          selectedKeys={selectedKeys}
          onSelect={setSelectedKeys}
          onCreate={() => handleOpenDialog('create')}
          onView={(id) => handleOpenDialog('view', id)}
          onEdit={(id) => handleOpenDialog('edit', id)}
          onReload={handleReload}
          onPageChange={(nextPage, nextPageSize) => {
            if (page === nextPage && pageSize === nextPageSize) return
            setLoading(true)
            setSelectedKeys([])
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      </DataTablePageLayout>
      <DeviceFormModal
        open={dialogMode === 'create' || dialogMode === 'edit'}
        device={detail}
        editing={dialogMode === 'edit'}
        loading={detailLoading}
        loadError={detailError}
        locations={locations}
        canChangeStatus={canChangeStatus}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onRetry={handleRetryDetail}
        onCancel={handleCloseDialog}
      />
      <DeviceDetailModal
        open={dialogMode === 'view'}
        device={detail}
        loading={detailLoading}
        loadError={detailError}
        onRetry={handleRetryDetail}
        onClose={handleCloseDialog}
      />
    </>
  )
}

export default DeviceListPage
