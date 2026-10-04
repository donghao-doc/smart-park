import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, type TableColumnsType } from 'antd'

import DataTablePanel from '@/components/data-table-panel'
import type { VisitorRecordDto, VisitorRecordStatus } from '@/types/visitor-record'
import { formatDateTime, maskPhoneNumber } from '@/utils'
import RecordStatus from './record-status'
import './record-table.scss'

interface RecordTableProps {
  /** 当前页到访记录 */
  records: VisitorRecordDto[]
  /** 满足筛选条件的总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页记录数 */
  pageSize: number
  /** 列表请求是否进行中 */
  loading: boolean
  /** 列表请求是否失败 */
  loadError: boolean
  /** 打开只读详情 */
  onView: (recordId: string) => void
  /** 刷新当前页及统计 */
  onReload: () => void
  /** 更新分页条件 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 到访记录表格，仅提供查看操作，复用公共滚动和分页能力 */
function RecordTable({
  records,
  total,
  page,
  pageSize,
  loading,
  loadError,
  onView,
  onReload,
  onPageChange,
}: RecordTableProps) {
  const columns: TableColumnsType<VisitorRecordDto> = [
    {
      title: '#',
      key: 'index',
      width: 54,
      render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
    },
    { title: '访客姓名', dataIndex: 'visitorName', width: 100 },
    {
      title: '手机号',
      dataIndex: 'visitorPhone',
      width: 125,
      render: (phone: string) => maskPhoneNumber(phone),
    },
    { title: '受访人', dataIndex: 'hostName', width: 90 },
    {
      title: '所属企业',
      dataIndex: 'enterpriseName',
      width: 220,
      ellipsis: true,
    },
    {
      title: '预约时间',
      dataIndex: 'scheduledStartAt',
      width: 164,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '签到时间',
      dataIndex: 'checkedInAt',
      width: 164,
      render: (time: string | null) => (time ? formatDateTime(time) : '-'),
    },
    {
      title: '签出时间',
      dataIndex: 'checkedOutAt',
      width: 164,
      render: (time: string | null) => (time ? formatDateTime(time) : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 96,
      render: (status: VisitorRecordStatus) => <RecordStatus status={status} />,
    },
    {
      title: '查看',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_value, record) => (
        <Button
          type="link"
          aria-label={`查看${record.visitorName}的到访记录`}
          onClick={() => onView(record.id)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <DataTablePanel<VisitorRecordDto>
      ariaLabel="到访记录列表"
      className="record-table-panel"
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
            title="到访记录加载失败"
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
        locale: { emptyText: '暂无到访记录' },
      }}
      scrollX={1247}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default RecordTable
