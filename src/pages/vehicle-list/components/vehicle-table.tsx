import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Popconfirm, type TableColumnsType } from 'antd'

import DataTablePanel from '@/components/data-table-panel'
import type { VehicleDto, VehicleStatus, VehicleType } from '@/types/vehicle'
import { formatDateTime } from '@/utils'
import VehicleTag from './vehicle-tag'
import './vehicle-table.scss'

interface VehicleTableProps {
  /** 当前页车辆档案 */
  vehicles: VehicleDto[]
  /** 符合筛选条件的档案总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页展示数量 */
  pageSize: number
  /** 是否正在加载列表 */
  loading: boolean
  /** 列表是否加载失败 */
  loadError: boolean
  /** 是否具备登记权限 */
  canCreate: boolean
  /** 是否具备编辑权限 */
  canUpdate: boolean
  /** 是否具备启停权限 */
  canChangeStatus: boolean
  /** 当前正在启停的车辆标识 */
  updatingStatusId?: string
  /** 打开新增弹窗 */
  onCreate: () => void
  /** 查看指定车辆 */
  onView: (id: string) => void
  /** 编辑指定车辆 */
  onEdit: (id: string) => void
  /** 确认启停车辆并刷新列表 */
  onChangeStatus: (vehicle: VehicleDto) => Promise<void>
  /** 重新加载列表 */
  onRetry: () => void
  /** 更新分页状态 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 车辆档案表格，统一展示类型、状态、分页和基于权限的操作入口 */
function VehicleTable({
  vehicles,
  total,
  page,
  pageSize,
  loading,
  loadError,
  canCreate,
  canUpdate,
  canChangeStatus,
  updatingStatusId,
  onCreate,
  onView,
  onEdit,
  onChangeStatus,
  onRetry,
  onPageChange,
}: VehicleTableProps) {
  const columns: TableColumnsType<VehicleDto> = [
    {
      title: '#',
      key: 'index',
      width: 54,
      render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
    },
    { title: '车牌号', dataIndex: 'plateNumber', width: 126 },
    {
      title: '车辆类型',
      dataIndex: 'type',
      width: 108,
      render: (type: VehicleType) => <VehicleTag value={type} />,
    },
    { title: '车主', dataIndex: 'ownerName', width: 90 },
    {
      title: '所属企业',
      dataIndex: 'enterpriseName',
      width: 220,
      ellipsis: true,
    },
    { title: '联系电话', dataIndex: 'phone', width: 140 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: VehicleStatus) => <VehicleTag value={status} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '操作',
      key: 'actions',
      width: 64 + (canUpdate ? 50 : 0) + (canChangeStatus ? 50 : 0),
      fixed: 'right',
      render: (_value, vehicle) => (
        <Flex
          className="vehicle-table-actions"
          align="center"
          gap={2}
          wrap={false}
        >
          <Button
            type="link"
            aria-label={`查看${vehicle.plateNumber}的车辆档案`}
            onClick={() => onView(vehicle.id)}
          >
            查看
          </Button>
          {canUpdate ? (
            <Button
              type="link"
              aria-label={`编辑${vehicle.plateNumber}的车辆档案`}
              onClick={() => onEdit(vehicle.id)}
            >
              编辑
            </Button>
          ) : null}
          {canChangeStatus ? (
            <Popconfirm
              title={`确认${vehicle.status === 'active' ? '停用' : '启用'}车辆？`}
              description={vehicle.plateNumber}
              okText="确认"
              cancelText="取消"
              onConfirm={() => onChangeStatus(vehicle)}
              okButtonProps={{ loading: updatingStatusId === vehicle.id }}
            >
              <Button
                type="link"
                danger={vehicle.status === 'active'}
                disabled={Boolean(updatingStatusId)}
                aria-label={`${vehicle.status === 'active' ? '停用' : '启用'}${vehicle.plateNumber}`}
              >
                {vehicle.status === 'active' ? '停用' : '启用'}
              </Button>
            </Popconfirm>
          ) : null}
        </Flex>
      ),
    },
  ]

  return (
    <DataTablePanel<VehicleDto>
      ariaLabel="车辆档案列表"
      className="vehicle-table-panel"
      toolbar={canCreate ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          新增车辆
        </Button>
      ) : undefined}
      feedback={loadError ? (
        <Alert
          type="error"
          showIcon
          title="车辆档案加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : undefined}
      tableProps={{
        rowKey: 'id',
        columns,
        dataSource: vehicles,
        loading,
        locale: { emptyText: '暂无车辆档案，请调整筛选条件或新增车辆' },
      }}
      scrollX={1062 + (canUpdate ? 50 : 0) + (canChangeStatus ? 50 : 0)}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default VehicleTable
