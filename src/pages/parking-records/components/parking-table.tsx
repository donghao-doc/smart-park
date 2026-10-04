import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, type TableColumnsType } from 'antd'

import DataTablePanel from '@/components/data-table-panel'
import type {
  ParkingRecordDto,
  ParkingRecordStatus,
  ParkingVehicleType,
} from '@/types/parking-record'
import { formatDateTime } from '@/utils'
import { formatParkingDuration } from '@/utils/parking-record'
import { parkingVehicleTypeLabels } from '../parking-options'
import ParkingStatus from './parking-status'
import './parking-table.scss'

interface ParkingTableProps {
  /** 当前页记录 */
  records: ParkingRecordDto[]
  /** 满足筛选条件的记录总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页记录数 */
  pageSize: number
  /** 是否正在加载列表 */
  loading: boolean
  /** 列表请求是否失败 */
  loadError: boolean
  /** 展示指定记录详情 */
  onView: (recordId: string) => void
  /** 刷新列表与停车统计 */
  onReload: () => void
  /** 更新分页条件 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 停车记录只读表格，复用公共组件的剩余高度计算和固定分页 */
function ParkingTable({
  records,
  total,
  page,
  pageSize,
  loading,
  loadError,
  onView,
  onReload,
  onPageChange,
}: ParkingTableProps) {
  const columns: TableColumnsType<ParkingRecordDto> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
    },
    { title: '车牌号', dataIndex: 'plateNumber', width: 120 },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      width: 96,
      render: (type: ParkingVehicleType) => parkingVehicleTypeLabels[type],
    },
    { title: '入口', dataIndex: 'entrance', width: 72 },
    {
      title: '入场时间',
      dataIndex: 'enteredAt',
      width: 168,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '出口',
      dataIndex: 'exit',
      width: 72,
      render: (exit: string | null) => exit ?? '-',
    },
    {
      title: '出场时间',
      dataIndex: 'exitedAt',
      width: 168,
      render: (time: string | null) => (time ? formatDateTime(time) : '-'),
    },
    {
      title: '停留时长',
      key: 'duration',
      width: 140,
      render: (_value, record) => formatParkingDuration(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 112,
      render: (status: ParkingRecordStatus) => <ParkingStatus status={status} />,
    },
    {
      title: '查看',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_value, record) => (
        <Button
          type="link"
          aria-label={`查看${record.plateNumber}的停车记录`}
          onClick={() => onView(record.id)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <DataTablePanel<ParkingRecordDto>
      ariaLabel="停车记录列表"
      className="parking-table-panel"
      toolbar={
        <Flex flex={1} justify="end">
          <Button icon={<ReloadOutlined />} loading={loading} onClick={onReload}>
            刷新
          </Button>
        </Flex>
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            title="停车记录加载失败"
            action={
              <Button size="small" onClick={onReload}>
                重试
              </Button>
            }
          />
        ) : undefined
      }
      tableProps={{
        rowKey: 'id',
        columns,
        dataSource: records,
        loading,
        locale: { emptyText: '暂无停车记录' },
      }}
      scrollX={1068}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default ParkingTable
