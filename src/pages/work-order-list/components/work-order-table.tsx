import { MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Dropdown, Flex, type TableColumnsType } from 'antd'

import DataTablePanel from '@/components/data-table-panel'
import type { UserDto } from '@/types/auth'
import type { WorkOrderAction, WorkOrderDto, WorkOrderPriority, WorkOrderType } from '@/types/work-order'
import { formatDateTime } from '@/utils'
import { getWorkOrderActions, workOrderActionLabels, workOrderTypeLabels } from '@/utils/work-order'
import { WorkOrderPriorityTag, WorkOrderStatusTag } from './work-order-tag'
import './work-order-table.scss'

interface WorkOrderTableProps {
  /** 当前分页的工单 */
  orders: WorkOrderDto[]
  /** 当前登录用户，提供动作权限和处理人身份 */
  currentUser: UserDto | null
  /** 满足查询条件的总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 列表是否正在加载 */
  loading: boolean
  /** 列表加载是否失败 */
  loadError: boolean
  /** 打开创建表单 */
  onCreate: () => void
  /** 打开详情 */
  onView: (id: string) => void
  /** 打开工单操作表单 */
  onAction: (order: WorkOrderDto, action: WorkOrderAction) => void
  /** 刷新列表和统计 */
  onReload: () => void
  /** 更新分页 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 工单列表与权限操作，内部滚动和分页由公共面板统一管理 */
function WorkOrderTable({
  orders,
  currentUser,
  total,
  page,
  pageSize,
  loading,
  loadError,
  onCreate,
  onView,
  onAction,
  onReload,
  onPageChange,
}: WorkOrderTableProps) {
  const canCreate = currentUser?.role.permissions.includes('work-order:create') ?? false
  const columns: TableColumnsType<WorkOrderDto> = [
    { title: '工单编号', dataIndex: 'code', width: 150 },
    {
      title: '标题',
      dataIndex: 'title',
      width: 150,
      ellipsis: true,
    },
    {
      title: '工单类型',
      dataIndex: 'type',
      width: 80,
      render: (type: WorkOrderType) => workOrderTypeLabels[type],
    },
    {
      title: '所属企业',
      dataIndex: 'enterpriseName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '紧急程度',
      dataIndex: 'priority',
      width: 80,
      render: (priority: WorkOrderPriority) => <WorkOrderPriorityTag priority={priority} />,
    },
    {
      title: '处理人',
      dataIndex: 'assigneeName',
      width: 100,
      ellipsis: true,
      render: (name: string | null) => name ?? '—',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 155,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 85,
      render: (_value, order) => <WorkOrderStatusTag status={order.status} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_value, order) => {
        const actions = getWorkOrderActions(
          order,
          currentUser?.role.permissions ?? [],
          currentUser?.id ?? '',
        )
        const primaryAction = actions.find(
          (action) => action !== 'assign' && action !== 'cancel' && action !== 'reopen',
        )
        const moreActions = actions.filter((action) => action !== primaryAction)
        const actionLabels: Partial<Record<WorkOrderAction, string>> = {
          accept: '受理',
          start: '处理',
          submit: '提交结果',
          confirm: '确认',
        }
        return (
          <Flex align="center" gap={14}>
            <Button type="link" onClick={() => onView(order.id)}>查看</Button>
            {primaryAction ? (
              <Button type="link" onClick={() => onAction(order, primaryAction)}>
                {actionLabels[primaryAction] ?? workOrderActionLabels[primaryAction]}
              </Button>
            ) : null}
            {moreActions.length ? (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: moreActions.map((action) => ({
                    key: action,
                    label: workOrderActionLabels[action],
                    danger: action === 'cancel',
                  })),
                  onClick: ({ key }) => onAction(order, key as WorkOrderAction),
                }}
              >
                <Button type="text" icon={<MoreOutlined />} aria-label={`工单${order.code}的更多操作`} />
              </Dropdown>
            ) : null}
          </Flex>
        )
      },
    },
  ]
  return (
    <DataTablePanel<WorkOrderDto>
      ariaLabel="工单列表"
      className="work-order-table-panel"
      toolbar={
        <Flex
          flex={1}
          justify={canCreate ? 'space-between' : 'end'}
          align="center"
        >
          {canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>创建工单</Button>
          ) : null}
          <Button icon={<ReloadOutlined />} loading={loading} onClick={onReload}>刷新</Button>
        </Flex>
      }
      feedback={loadError ? (
        <Alert
          type="error"
          showIcon
          title="工单列表加载失败"
          action={<Button size="small" onClick={onReload}>重试</Button>}
        />
      ) : undefined}
      tableProps={{
        rowKey: 'id',
        columns,
        dataSource: orders,
        loading,
        locale: { emptyText: '暂无符合条件的工单' },
      }}
      scrollX={1110}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default WorkOrderTable
