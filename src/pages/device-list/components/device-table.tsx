import { PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, type TableColumnsType } from 'antd'
import type { Key } from 'react'

import DataTablePanel from '@/components/data-table-panel'
import type { DeviceDto, DeviceStatus, DeviceType } from '@/types/device'
import { formatDateTime } from '@/utils'
import { deviceTypeLabels } from '@/utils/device'
import DeviceStatusTag from './device-status'
import './device-table.scss'

interface DeviceTableProps {
  /** 当前页设备 */
  devices: DeviceDto[]
  /** 筛选结果总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 列表加载状态 */
  loading: boolean
  /** 列表是否加载失败 */
  loadError: boolean
  /** 是否允许新增 */
  canCreate: boolean
  /** 是否允许编辑 */
  canUpdate: boolean
  /** 当前页已选设备标识 */
  selectedKeys: Key[]
  /** 更新当前页选择 */
  onSelect: (keys: Key[]) => void
  /** 打开新增弹窗 */
  onCreate: () => void
  /** 查看设备详情 */
  onView: (id: string) => void
  /** 编辑设备档案 */
  onEdit: (id: string) => void
  /** 刷新列表及统计 */
  onReload: () => void
  /** 切换页码或每页数量 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 设备表格，复用公共滚动面板并显示当前页勾选数量 */
function DeviceTable({
  devices,
  total,
  page,
  pageSize,
  loading,
  loadError,
  canCreate,
  canUpdate,
  selectedKeys,
  onSelect,
  onCreate,
  onView,
  onEdit,
  onReload,
  onPageChange,
}: DeviceTableProps) {
  const columns: TableColumnsType<DeviceDto> = [
    { title: '设备编码', dataIndex: 'code', width: 116 },
    {
      title: '设备名称',
      dataIndex: 'name',
      width: 210,
      ellipsis: true,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      width: 116,
      render: (type: DeviceType) => deviceTypeLabels[type],
    },
    {
      title: '位置',
      dataIndex: 'location',
      width: 156,
      ellipsis: true,
    },
    { title: '责任人', dataIndex: 'ownerName', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 88,
      render: (status: DeviceStatus) => <DeviceStatusTag status={status} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 174,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '操作',
      key: 'actions',
      width: canUpdate ? 116 : 66,
      fixed: 'right',
      render: (_value, device) => (
        <Flex align="center" gap={4} className="device-table-actions">
          <Button
            type="link"
            aria-label={`查看${device.code}的设备详情`}
            onClick={() => onView(device.id)}
          >
            查看
          </Button>
          {canUpdate ? (
            <Button
              type="link"
              aria-label={`编辑${device.code}的设备档案`}
              onClick={() => onEdit(device.id)}
            >
              编辑
            </Button>
          ) : null}
        </Flex>
      ),
    },
  ]
  return (
    <DataTablePanel<DeviceDto>
      ariaLabel="设备列表"
      className="device-table-panel"
      toolbar={(
        <>
          <Flex align="center" gap={12}>
            {canCreate ? (
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={onCreate}>新增设备</Button>
            ) : null}
          </Flex>
          <Button
            icon={<ReloadOutlined />}
            aria-label="刷新设备列表及统计"
            onClick={onReload}
            loading={loading}
          >
            刷新
          </Button>
        </>
      )}
      feedback={loadError ? (
        <Alert
          type="error"
          showIcon
          title="设备列表加载失败"
          action={<Button size="small" onClick={onReload}>重试</Button>}
        />
      ) : undefined}
      tableProps={{
        rowKey: 'id',
        columns,
        dataSource: devices,
        loading,
        rowSelection: { selectedRowKeys: selectedKeys, onChange: onSelect, columnWidth: 44 },
        locale: { emptyText: '暂无设备，请调整筛选条件或新增设备' },
      }}
      scrollX={1210}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showTotal: () => `已选择 ${selectedKeys.length} 项 · 共 ${total} 条记录`,
      }}
    />
  )
}

export default DeviceTable
