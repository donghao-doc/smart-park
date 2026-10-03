import { App } from 'antd'
import { useEffect, useState } from 'react'

import {
  reqCreateVisitorAppointment,
  reqGetEnterprises,
  reqGetPersonnelList,
  reqGetVisitorAppointments,
  reqGetVisitorAppointmentSummary,
  reqUpdateVisitorAppointmentStatus,
} from '@/api'
import { DataTablePageLayout } from '@/components/data-table-panel'
import { useUserStore } from '@/stores/user'
import type { EnterpriseListItemDto } from '@/types/enterprise'
import type { PersonnelDto } from '@/types/personnel'
import type {
  CreateVisitorAppointmentRequest,
  VisitorAppointmentAction,
  VisitorAppointmentDto,
  VisitorAppointmentSummaryDto,
} from '@/types/visitor-appointment'
import AppointmentFilter from './components/appointment-filter'
import type { AppointmentFilterValues } from './components/appointment-filter'
import AppointmentFormModal from './components/appointment-form-modal'
import AppointmentReasonModal from './components/appointment-reason-modal'
import AppointmentSummary from './components/appointment-summary'
import AppointmentTable from './components/appointment-table'
import './visitor-appointments.scss'

const DEFAULT_PAGE_SIZE = 20

/**
 * 访客预约页面，提供预约创建、审批、签到、签出和取消的完整流程
 */
function VisitorAppointmentsPage() {
  const { message } = App.useApp()
  const currentUser = useUserStore((state) => state.currentUser)
  const hasPermission = useUserStore((state) => state.hasPermission)
  const [appointments, setAppointments] = useState<VisitorAppointmentDto[]>([])
  const [summary, setSummary] = useState<VisitorAppointmentSummaryDto>()
  const [enterprises, setEnterprises] = useState<EnterpriseListItemDto[]>([])
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<AppointmentFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string>()
  const [reasonAction, setReasonAction] = useState<'reject' | 'cancel'>('reject')
  const [reasonAppointment, setReasonAppointment] = useState<VisitorAppointmentDto>()
  const enterpriseLocked = currentUser?.role.code === 'enterprise_user'
  const defaultEnterpriseId = currentUser?.enterprise?.id

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const [enterpriseResult, personnelResult] = await Promise.all([
          reqGetEnterprises({ page: 1, pageSize: 100 }),
          reqGetPersonnelList({ page: 1, pageSize: 100, status: 'active' }),
        ])
        if (active) {
          setEnterprises(enterpriseResult.list)
          setPersonnel(personnelResult.list)
        }
      } catch {
        if (active) {
          setEnterprises([])
          setPersonnel([])
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
        const result = await reqGetVisitorAppointments({
          page,
          pageSize,
          visitorName: filters.visitorName?.trim() || undefined,
          enterpriseId: enterpriseLocked ? defaultEnterpriseId : filters.enterpriseId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
        })
        if (active) {
          setAppointments(result.list)
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
  }, [defaultEnterpriseId, enterpriseLocked, filters, page, pageSize, reloadVersion])

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetVisitorAppointmentSummary()
        if (active) {
          setSummary(result)
          setSummaryError(false)
        }
      } catch {
        if (active) {
          setSummaryError(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [reloadVersion])

  const enterpriseOptions = enterprises.map((enterprise) => ({
    label: enterprise.name,
    value: enterprise.id,
  }))
  const activeEnterpriseOptions = enterprises
    .filter((enterprise) => enterprise.status === 'active')
    .map((enterprise) => ({ label: enterprise.name, value: enterprise.id }))

  /**
   * 刷新预约列表和顶部统计
   */
  function reloadAppointments() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /**
   * 创建预约并回到列表第一页
   */
  async function handleCreate(values: CreateVisitorAppointmentRequest) {
    setSubmitting(true)
    try {
      await reqCreateVisitorAppointment(values)
      setFormOpen(false)
      setPage(1)
      void message.success('访客预约创建成功')
      reloadAppointments()
    } catch {
      // 接口错误由统一 HTTP 层展示，弹窗保持打开便于修正
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 提交预约状态流转
   */
  async function submitAction(
    action: VisitorAppointmentAction,
    appointment: VisitorAppointmentDto,
    reason?: string,
  ) {
    setActionLoadingId(appointment.id)
    try {
      await reqUpdateVisitorAppointmentStatus(appointment.id, { action, reason })
      setReasonAppointment(undefined)
      void message.success({
        approve: '预约已通过',
        reject: '预约已驳回',
        check_in: '访客签到成功',
        check_out: '访客签出成功',
        cancel: '预约已取消',
      }[action])
      reloadAppointments()
    } catch {
      // 接口错误由统一 HTTP 层展示
    } finally {
      setActionLoadingId(undefined)
    }
  }

  /**
   * 需要原因的动作先打开表单，其余动作立即提交
   */
  function handleAction(action: VisitorAppointmentAction, appointment: VisitorAppointmentDto) {
    if (action === 'reject' || action === 'cancel') {
      setReasonAction(action)
      setReasonAppointment(appointment)
      return
    }
    void submitAction(action, appointment)
  }

  return (
    <>
      <DataTablePageLayout className="visitor-appointments-page">
        <AppointmentSummary summary={summary} loadError={summaryError} />

        <AppointmentFilter
          enterpriseOptions={enterpriseOptions}
          enterpriseLocked={enterpriseLocked}
          defaultEnterpriseId={defaultEnterpriseId}
          onSearch={(values) => {
            setLoading(true)
            setPage(1)
            setFilters(values)
          }}
        />

        <AppointmentTable
          appointments={appointments}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          loadError={loadError}
          actionLoadingId={actionLoadingId}
          canCreate={hasPermission('visitor:create')}
          canApprove={hasPermission('visitor:approve')}
          canCheckIn={hasPermission('visitor:check-in')}
          canCheckOut={hasPermission('visitor:check-out')}
          canCancel={hasPermission('visitor:cancel')}
          onCreate={() => setFormOpen(true)}
          onAction={handleAction}
          onRetry={reloadAppointments}
          onPageChange={(nextPage, nextPageSize) => {
            setLoading(true)
            setPageSize(nextPageSize)
            setPage(nextPage)
          }}
        />
      </DataTablePageLayout>

      <AppointmentFormModal
        open={formOpen}
        enterpriseOptions={activeEnterpriseOptions}
        personnel={personnel}
        enterpriseLocked={enterpriseLocked}
        defaultEnterpriseId={defaultEnterpriseId}
        submitting={submitting}
        onSubmit={(values) => void handleCreate(values)}
        onCancel={() => setFormOpen(false)}
      />

      <AppointmentReasonModal
        open={Boolean(reasonAppointment)}
        action={reasonAction}
        appointment={reasonAppointment}
        submitting={Boolean(actionLoadingId)}
        onSubmit={(reason) => {
          if (reasonAppointment) {
            void submitAction(reasonAction, reasonAppointment, reason)
          }
        }}
        onCancel={() => setReasonAppointment(undefined)}
      />
    </>
  )
}

export default VisitorAppointmentsPage
