import { Alert, Button, type TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import DataTablePanel from '@/components/data-table-panel'
import type { OperationLogDto, OperationLogResult } from '@/types/operation-log'
import { operationLogModuleLabels } from '@/utils/operation-log'
import OperationLogResultTag from './operation-log-result'
import './operation-log-table.scss'

interface OperationLogTableProps {
  /** 当前页日志摘要 */
  logs: OperationLogDto[]
  /** 匹配筛选条件的总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 列表是否正在加载 */
  loading: boolean
  /** 列表是否加载失败 */
  loadError: boolean
  /** 当前详情对应的日志标识，用于高亮 */
  selectedId?: string
  /** 打开日志详情 */
  onView: (id: string) => void
  /** 重试当前查询 */
  onRetry: () => void
  /** 切换页码或每页条数 */
  onPageChange: (page: number, pageSize: number) => void
}

/** 展示操作日志摘要，复用公共表格的滚动、反馈和固定分页 */
function OperationLogTable({
  logs,
  total,
  page,
  pageSize,
  loading,
  loadError,
  selectedId,
  onView,
  onRetry,
  onPageChange,
}: OperationLogTableProps) {
  const columns = useMemo<TableColumnsType<OperationLogDto>>(
    () => [
      {
        title: '操作时间',
        dataIndex: 'operatedAt',
        width: 184,
        render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      },
      { title: '操作人', dataIndex: 'operatorName', width: 90 },
      { title: '角色', dataIndex: 'roleName', width: 130 },
      {
        title: '模块',
        dataIndex: 'module',
        width: 105,
        render: (value: OperationLogDto['module']) => operationLogModuleLabels[value],
      },
      { title: '操作动作', dataIndex: 'action', width: 100 },
      {
        title: '操作对象',
        dataIndex: 'objectName',
        width: 210,
        ellipsis: true,
        render: (value: string | null) => value ?? '—',
      },
      { title: 'IP 地址', dataIndex: 'ipAddress', width: 140 },
      {
        title: '结果',
        dataIndex: 'result',
        width: 90,
        render: (result: OperationLogResult) => <OperationLogResultTag result={result} />,
      },
      {
        title: '详情',
        key: 'detail',
        width: 76,
        fixed: 'right',
        render: (_value, record) => (
          <Button
            type="link"
            className="operation-log-view-button"
            onClick={() => onView(record.id)}
            aria-label={`查看${record.operatorName}${record.action}日志详情`}
          >
            查看
          </Button>
        ),
      },
    ],
    [onView],
  )

  return (
    <DataTablePanel<OperationLogDto>
      className="operation-log-table-panel"
      ariaLabel="操作日志列表"
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            title="操作日志加载失败"
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
        columns,
        dataSource: logs,
        loading,
        rowClassName: (record) => (record.id === selectedId ? 'is-selected' : ''),
        locale: {
          emptyText: loadError ? '日志加载失败，请重试' : '暂无符合条件的操作日志',
        },
      }}
      scrollX={1125}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default OperationLogTable
