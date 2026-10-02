import type { TableColumnsType } from 'antd'
import { Alert, Button, Descriptions, Input, Modal, Select, Table, Tag } from 'antd'
import { useMemo, useState } from 'react'

import type {
  ParkBuildingDto,
  ParkSpaceDto,
  ParkSpaceStatus,
} from '../../../types/park-profile'
import './park-space-table-panel.scss'

interface ParkSpaceTablePanelProps {
  /** 园区楼宇列表 */
  buildings: ParkBuildingDto[]
  /** 当前页空间列表 */
  spaces: ParkSpaceDto[]
  /** 空间总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页空间数量 */
  pageSize: number
  /** 当前选中的楼宇标识 */
  buildingId?: string
  /** 当前空间使用状态 */
  status?: ParkSpaceStatus
  /** 当前空间搜索词 */
  keywordInput: string
  /** 是否正在加载空间列表 */
  loading: boolean
  /** 空间列表是否加载失败 */
  error: boolean
  /** 切换楼宇筛选 */
  onBuildingChange: (buildingId?: string) => void
  /** 切换空间状态筛选 */
  onStatusChange: (status?: ParkSpaceStatus) => void
  /** 更新空间搜索词 */
  onKeywordChange: (value: string) => void
  /** 提交空间搜索 */
  onKeywordSearch: (value: string) => void
  /** 切换空间列表页码 */
  onPageChange: (page: number) => void
}

const spaceColumns: TableColumnsType<ParkSpaceDto> = [
  {
    title: '#',
    key: 'index',
    width: 56,
    render: (_value, _record, index) => index + 1,
  },
  { title: '空间名称', dataIndex: 'name', width: 120 },
  { title: '所属楼宇', dataIndex: 'buildingName', width: 110 },
  { title: '楼层', dataIndex: 'floorName', width: 90 },
  { title: '空间类型', dataIndex: 'type', width: 120 },
  {
    title: '面积（㎡）',
    dataIndex: 'area',
    width: 130,
    render: (value: number) => value.toLocaleString('zh-CN'),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (status: ParkSpaceStatus) => (
      <Tag className={`park-space-status is-${status}`} variant="filled">
        {status === 'used' ? '已使用' : '空闲'}
      </Tag>
    ),
  },
]

/**
 * 展示空间筛选器、分页列表和空间详情
 */
function ParkSpaceTablePanel({
  buildings,
  spaces,
  total,
  page,
  pageSize,
  buildingId,
  status,
  keywordInput,
  loading,
  error,
  onBuildingChange,
  onStatusChange,
  onKeywordChange,
  onKeywordSearch,
  onPageChange,
}: ParkSpaceTablePanelProps) {
  const [selectedSpace, setSelectedSpace] = useState<ParkSpaceDto>()
  const columns = useMemo<TableColumnsType<ParkSpaceDto>>(
    () => [
      ...spaceColumns,
      {
        title: '操作',
        key: 'action',
        width: 90,
        render: (_value, record) => (
          <Button type="link" className="park-space-view" onClick={() => setSelectedSpace(record)}>
            查看
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="park-space-table-panel">
      <div className="park-space-table-toolbar">
        <h2>空间概况</h2>
        <div className="park-space-filters">
          <Select
            value={buildingId}
            allowClear
            placeholder="全部楼宇"
            options={buildings.map((building) => ({
              label: building.name,
              value: building.id,
            }))}
            onChange={onBuildingChange}
          />
          <Select
            value={status}
            allowClear
            placeholder="全部状态"
            options={[
              { label: '已使用', value: 'used' },
              { label: '空闲', value: 'vacant' },
            ]}
            onChange={onStatusChange}
          />
          <Input.Search
            allowClear
            placeholder="搜索空间名称或编号"
            value={keywordInput}
            onChange={(event) => onKeywordChange(event.target.value)}
            onSearch={(value) => onKeywordSearch(value.trim())}
          />
        </div>
      </div>

      {error ? (
        <Alert type="error" showIcon message="空间数据加载失败，请稍后重试" />
      ) : (
        <Table<ParkSpaceDto>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={spaces}
          loading={loading}
          scroll={{ x: 850 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (spaceTotal) => `共 ${spaceTotal} 条`,
            onChange: onPageChange,
          }}
        />
      )}

      <Modal
        title="空间详情"
        open={Boolean(selectedSpace)}
        footer={null}
        onCancel={() => setSelectedSpace(undefined)}
        destroyOnHidden
      >
        {selectedSpace ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="空间名称">{selectedSpace.name}</Descriptions.Item>
            <Descriptions.Item label="所属位置">
              {selectedSpace.buildingName} · {selectedSpace.floorName}
            </Descriptions.Item>
            <Descriptions.Item label="空间类型">{selectedSpace.type}</Descriptions.Item>
            <Descriptions.Item label="空间面积">{selectedSpace.area} ㎡</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              {selectedSpace.status === 'used' ? '已使用' : '空闲'}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  )
}

export default ParkSpaceTablePanel
