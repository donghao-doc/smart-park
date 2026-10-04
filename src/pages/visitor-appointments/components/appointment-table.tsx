import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Dropdown,
  Flex,
  Popconfirm,
  Tag,
  Tooltip,
  type MenuProps,
  type TableColumnsType,
} from 'antd'
import { useMemo } from 'react'

import DataTablePanel from '@/components/data-table-panel'
import type {
  VisitorAppointmentAction,
  VisitorAppointmentDto,
  VisitorAppointmentStatus,
} from '@/types/visitor-appointment'
import { formatDateTime, maskPhoneNumber } from '@/utils'

interface AppointmentTablePermissions {
  /** 是否可以创建预约 */
  canCreate: boolean
  /** 是否可以审批预约 */
  canApprove: boolean
  /** 是否可以办理签到 */
  canCheckIn: boolean
  /** 是否可以办理签出 */
  canCheckOut: boolean
  /** 是否可以取消预约 */
  canCancel: boolean
}

interface AppointmentTableProps extends AppointmentTablePermissions {
  /** 当前页预约数据 */
  appointments: VisitorAppointmentDto[]
  /** 满足筛选条件的预约总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页展示数量 */
  pageSize: number
  /** 列表是否正在加载 */
  loading: boolean
  /** 列表加载是否失败 */
  loadError: boolean
  /** 正在更新状态的预约标识 */
  actionLoadingId?: string
  /** 打开创建预约表单 */
  onCreate: () => void
  /** 执行预约流程动作 */
  onAction: (action: VisitorAppointmentAction, appointment: VisitorAppointmentDto) => void
  /** 重新加载当前页数据 */
  onRetry: () => void
  /** 更新页码和每页展示数量 */
  onPageChange: (page: number, pageSize: number) => void
}

const statusLabels: Record<VisitorAppointmentStatus, string> = {
  pending: '待审批',
  approved: '待到访',
  checked_in: '已到访',
  checked_out: '已离园',
  rejected: '已驳回',
  cancelled: '已取消',
  expired: '已过期',
}

/**
 * 访客预约列表，负责状态、权限操作和分页交互
 */
function AppointmentTable({
  appointments,
  total,
  page,
  pageSize,
  loading,
  loadError,
  actionLoadingId,
  canCreate,
  canApprove,
  canCheckIn,
  canCheckOut,
  canCancel,
  onCreate,
  onAction,
  onRetry,
  onPageChange,
}: AppointmentTableProps) {
  const columns = useMemo<TableColumnsType<VisitorAppointmentDto>>(
    () => [
      { title: '预约编号', dataIndex: 'code', width: 170 },
      { title: '访客姓名', dataIndex: 'visitorName', width: 100 },
      {
        title: '手机号',
        dataIndex: 'visitorPhone',
        width: 130,
        render: (phone: string) => maskPhoneNumber(phone),
      },
      { title: '受访人', dataIndex: 'hostName', width: 90 },
      {
        title: '所属企业',
        dataIndex: 'enterpriseName',
        width: 210,
        ellipsis: true,
      },
      {
        title: '预约时间',
        dataIndex: 'scheduledStartAt',
        width: 170,
        render: (value: string) => formatDateTime(value),
      },
      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        width: 110,
        render: (value: string | null) => value ?? '-',
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: VisitorAppointmentStatus, record) => {
          const tag = (
            <Tag className={`appointment-status-tag is-${status}`} variant="filled">
              {statusLabels[status]}
            </Tag>
          )
          return record.terminationReason ? (
            <Tooltip title={record.terminationReason}>{tag}</Tooltip>
          ) : (
            tag
          )
        },
      },
      {
        title: '操作',
        key: 'actions',
        width: 190,
        fixed: 'right',
        render: (_value, record) => {
          const updating = actionLoadingId === record.id
          const cancelItem: MenuProps['items'] =
            canCancel && (record.status === 'pending' || record.status === 'approved')
              ? [{ key: 'cancel', label: '取消预约', danger: true }]
              : []

          return (
            <Flex className="appointment-table-actions" gap={2} align="center">
              {record.status === 'pending' && canApprove ? (
                <>
                  <Popconfirm
                    title="确认通过该预约？"
                    description="通过后访客可按预约时间到访"
                    okText="通过"
                    cancelText="取消"
                    onConfirm={() => onAction('approve', record)}
                  >
                    <Button type="link" disabled={updating}>
                      通过
                    </Button>
                  </Popconfirm>
                  <Button
                    type="link"
                    danger
                    disabled={updating}
                    onClick={() => onAction('reject', record)}
                  >
                    驳回
                  </Button>
                </>
              ) : null}
              {record.status === 'approved' && canCheckIn ? (
                <Popconfirm
                  title="确认为访客办理签到？"
                  okText="确认签到"
                  cancelText="取消"
                  onConfirm={() => onAction('check_in', record)}
                >
                  <Button type="link" disabled={updating}>
                    签到
                  </Button>
                </Popconfirm>
              ) : null}
              {record.status === 'checked_in' && canCheckOut ? (
                <Popconfirm
                  title="确认为访客办理签出？"
                  okText="确认签出"
                  cancelText="取消"
                  onConfirm={() => onAction('check_out', record)}
                >
                  <Button type="link" disabled={updating}>
                    签出
                  </Button>
                </Popconfirm>
              ) : null}
              {cancelItem.length > 0 ? (
                canApprove || canCheckIn ? (
                  <Dropdown
                    menu={{
                      items: cancelItem,
                      onClick: () => onAction('cancel', record),
                    }}
                    trigger={['click']}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      aria-label="更多预约操作"
                      disabled={updating}
                    />
                  </Dropdown>
                ) : (
                  <Button
                    type="link"
                    danger
                    disabled={updating}
                    onClick={() => onAction('cancel', record)}
                  >
                    取消
                  </Button>
                )
              ) : null}
              {record.status !== 'pending' &&
              record.status !== 'approved' &&
              record.status !== 'checked_in' ? (
                <span className="appointment-table-empty-action">-</span>
              ) : null}
            </Flex>
          )
        },
      },
    ],
    [actionLoadingId, canApprove, canCancel, canCheckIn, canCheckOut, onAction],
  )

  return (
    <DataTablePanel<VisitorAppointmentDto>
      ariaLabel="预约列表"
      className="appointment-table-panel"
      toolbar={
        canCreate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            创建预约
          </Button>
        ) : undefined
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            message="预约列表加载失败"
            action={
              <Button size="small" onClick={onRetry}>
                重试
              </Button>
            }
          />
        ) : undefined
      }
      tableProps={{
        rowKey: 'id',
        rowSelection: {},
        columns,
        dataSource: appointments,
        loading,
      }}
      scrollX={1280}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default AppointmentTable
