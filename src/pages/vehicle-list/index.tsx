import { App, type SelectProps } from 'antd'
import { useEffect, useState } from 'react'

import {
  reqCreateVehicle,
  reqGetVehicle,
  reqGetVehicleEnterpriseOptions,
  reqGetVehicles,
  reqUpdateVehicle,
  reqUpdateVehicleStatus,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useTableExcelExport } from '@/hooks/use-table-excel-export'
import { useUserStore } from '@/stores/user'
import type { VehicleDto, VehicleMutationRequest } from '@/types/vehicle'
import VehicleDetailModal from './components/vehicle-detail-modal'
import VehicleFilter, { type VehicleFilterValues } from './components/vehicle-filter'
import VehicleFormModal from './components/vehicle-form-modal'
import VehicleTable from './components/vehicle-table'
import { vehicleExportOptions } from './export-options'
import './vehicle-list.scss'

/** 车辆档案弹窗的业务模式 */
type DialogMode = 'create' | 'edit' | 'view'

const DEFAULT_PAGE_SIZE = 20

/** 车辆档案页面，负责分页筛选、跨页勾选导出、登记、详情、编辑及独立权限下的启停操作 */
function VehicleListPage() {
  const { message } = App.useApp()
  const [vehicles, setVehicles] = useState<VehicleDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<VehicleFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [enterpriseOptions, setEnterpriseOptions] = useState<NonNullable<SelectProps['options']>>(
    [],
  )
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState(false)
  const [optionsVersion, setOptionsVersion] = useState(0)
  const [dialogMode, setDialogMode] = useState<DialogMode>()
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<VehicleDto>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState<string>()
  const canCreate = useUserStore((state) => state.hasPermission('vehicle:create'))
  const canUpdate = useUserStore((state) => state.hasPermission('vehicle:update'))
  const canChangeStatus = useUserStore((state) => state.hasPermission('vehicle:status'))

  const { rowSelection, exportActions, clearSelection } = useTableExcelExport(
    vehicles,
    vehicleExportOptions,
    loading || loadError,
  )

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetVehicleEnterpriseOptions()
        if (active) {
          setEnterpriseOptions(result.map((item) => ({ label: item.name, value: item.id })))
          setOptionsError(false)
        }
      } catch {
        if (active) {
          setEnterpriseOptions([])
          setOptionsError(true)
        }
      } finally {
        if (active) setOptionsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [optionsVersion])

  useEffect(() => {
    let active = true
    void (async () => {
      let correctedPage = false
      try {
        const result = await reqGetVehicles({ ...filters, page, pageSize })
        if (active) {
          // 编辑或启停可能使当前页超出筛选后的页数，自动回到最后一个有效页
          const lastPage = Math.max(1, Math.ceil(result.total / pageSize))
          if (page > lastPage) {
            correctedPage = true
            setPage(lastPage)
            return
          }
          setVehicles(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setVehicles([])
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
    if (!selectedId || (dialogMode !== 'edit' && dialogMode !== 'view')) return
    let active = true
    void (async () => {
      try {
        const result = await reqGetVehicle(selectedId)
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
    // 关闭弹窗或切换车辆后忽略旧响应，防止覆盖新的详情
    return () => {
      active = false
    }
  }, [dialogMode, selectedId, detailVersion])

  /** 刷新当前分页和筛选条件下的列表，并清空过期选择 */
  function handleReload() {
    clearSelection()
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 应用筛选条件，清空跨页选择并从第一页重新查询 */
  function handleSearch(values: VehicleFilterValues) {
    clearSelection()
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  /** 打开指定业务弹窗并清除上一辆车的详情 */
  function handleOpenDialog(mode: DialogMode, vehicleId?: string) {
    setDetail(undefined)
    setDetailError(false)
    setDetailLoading(mode !== 'create')
    setSelectedId(vehicleId)
    setDialogMode(mode)
  }

  /** 关闭弹窗并取消对未完成详情请求的关注 */
  function handleCloseDialog() {
    if (submitting) return
    setDialogMode(undefined)
    setSelectedId(undefined)
  }

  /** 重新加载当前车辆详情 */
  function handleRetryDetail() {
    setDetailLoading(true)
    setDetailError(false)
    setDetailVersion((version) => version + 1)
  }

  /** 重新加载企业选项，保持当前筛选及表单输入 */
  function handleRetryOptions() {
    setOptionsLoading(true)
    setOptionsVersion((version) => version + 1)
  }

  /** 保存车辆档案，失败时保留表单便于修正输入 */
  async function handleSubmit(values: VehicleMutationRequest) {
    if (submitting || (dialogMode === 'edit' && !detail)) return
    setSubmitting(true)
    try {
      if (dialogMode === 'edit' && detail) {
        await reqUpdateVehicle(detail.id, values)
        void message.success('车辆档案已更新')
      } else {
        await reqCreateVehicle(values)
        setPage(1)
        void message.success('车辆登记成功')
      }
      setDialogMode(undefined)
      setSelectedId(undefined)
      handleReload()
    } catch {
      // 统一 HTTP 层展示接口错误，当前表单保持打开
    } finally {
      setSubmitting(false)
    }
  }

  /** 确认启停车辆并刷新列表，接口错误由统一 HTTP 层反馈 */
  async function handleChangeStatus(vehicle: VehicleDto) {
    if (updatingStatusId) return
    setUpdatingStatusId(vehicle.id)
    try {
      const status = vehicle.status === 'active' ? 'disabled' : 'active'
      await reqUpdateVehicleStatus(vehicle.id, { status })
      void message.success(status === 'active' ? '车辆已启用' : '车辆已停用')
      handleReload()
    } catch {
      // 请求失败时保留列表中的原状态，避免显示未生效的变更
    } finally {
      setUpdatingStatusId(undefined)
    }
  }

  return (
    <>
      <DataTablePageLayout className="vehicle-page">
        <VehicleFilter
          enterpriseOptions={enterpriseOptions}
          optionsLoading={optionsLoading}
          optionsError={optionsError}
          onRetryOptions={handleRetryOptions}
          onSearch={handleSearch}
        />
        <VehicleTable
          vehicles={vehicles}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          canCreate={canCreate}
          canUpdate={canUpdate}
          rowSelection={rowSelection}
          exportActions={exportActions}
          canChangeStatus={canChangeStatus}
          updatingStatusId={updatingStatusId}
          onCreate={() => handleOpenDialog('create')}
          onView={(id) => handleOpenDialog('view', id)}
          onEdit={(id) => handleOpenDialog('edit', id)}
          onChangeStatus={handleChangeStatus}
          onRetry={handleReload}
          onPageChange={(nextPage, nextPageSize) => {
            setLoading(true)
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      </DataTablePageLayout>
      <VehicleFormModal
        open={dialogMode === 'create' || dialogMode === 'edit'}
        vehicle={detail}
        editing={dialogMode === 'edit'}
        loading={detailLoading}
        loadError={detailError}
        enterpriseOptions={enterpriseOptions}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        canChangeStatus={canChangeStatus}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onRetry={handleRetryDetail}
        onRetryOptions={handleRetryOptions}
        onCancel={handleCloseDialog}
      />
      <VehicleDetailModal
        open={dialogMode === 'view'}
        vehicle={detail}
        loading={detailLoading}
        loadError={detailError}
        onRetry={handleRetryDetail}
        onClose={handleCloseDialog}
      />
    </>
  )
}

export default VehicleListPage
