import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Tag, type TableColumnsType, type TableProps } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import DataTablePanel from '@/components/data-table-panel'
import TableExportActions, { type TableExportActionsProps } from '@/components/table-export-actions'
import type { EnterpriseListItemDto, EnterpriseStatus } from '@/types/enterprise'
import './enterprise-table.scss'

interface EnterpriseTableProps {
  /** 当前页企业数据 */
  enterprises: EnterpriseListItemDto[]
  /** 满足筛选条件的企业总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页展示数量 */
  pageSize: number
  /** 列表是否正在加载 */
  loading: boolean
  /** 列表加载是否失败 */
  loadError: boolean
  /** 当前用户是否可以新增企业 */
  canCreate: boolean
  /** 当前用户是否可以编辑企业 */
  canUpdate: boolean
  /** 包含跨页勾选状态的表格选择配置 */
  rowSelection: NonNullable<TableProps<EnterpriseListItemDto>['rowSelection']>
  /** 已选数量、导出状态及导出操作 */
  exportActions: TableExportActionsProps
  /** 打开新增企业表单 */
  onCreate: () => void
  /** 打开指定企业的编辑表单 */
  onEdit: (enterpriseId: string) => void
  /** 重新加载当前页数据 */
  onRetry: () => void
  /** 更新页码和每页展示数量 */
  onPageChange: (page: number, pageSize: number) => void
}

/**
 * 企业列表表格，负责工具栏、状态反馈、列渲染、分页及跨页勾选导出
 */
function EnterpriseTable({
  enterprises,
  total,
  page,
  pageSize,
  loading,
  loadError,
  canCreate,
  canUpdate,
  rowSelection,
  exportActions,
  onCreate,
  onEdit,
  onRetry,
  onPageChange,
}: EnterpriseTableProps) {
  const navigate = useNavigate()

  const columns = useMemo<TableColumnsType<EnterpriseListItemDto>>(
    () => [
      {
        title: '#',
        width: 56,
        render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
      },
      { title: '企业名称', dataIndex: 'name', width: 210, ellipsis: true },
      { title: '统一社会信用代码', dataIndex: 'creditCode', width: 210 },
      { title: '行业', dataIndex: 'industry', width: 120 },
      { title: '联系人', dataIndex: 'contactName', width: 100 },
      { title: '联系电话', dataIndex: 'contactPhone', width: 140 },
      { title: '办公位置', dataIndex: 'officeLocation', width: 145 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: EnterpriseStatus) => (
          <Tag className={`enterprise-status-tag is-${status}`} variant="filled">
            {status === 'active' ? '已入驻' : '已停用'}
          </Tag>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: canUpdate ? 120 : 64,
        fixed: 'right',
        render: (_value, record) => (
          <Flex className="enterprise-table-actions" gap={2}>
            <Button type="link" onClick={() => void navigate(`/enterprises/${record.id}`)}>
              查看
            </Button>
            {canUpdate ? (
              <Button type="link" onClick={() => onEdit(record.id)}>
                编辑
              </Button>
            ) : null}
          </Flex>
        ),
      },
    ],
    [canUpdate, navigate, onEdit, page, pageSize],
  )

  return (
    <DataTablePanel<EnterpriseListItemDto>
      ariaLabel="企业列表"
      toolbar={
        <Flex
          className="enterprise-table-toolbar"
          flex={1}
          justify="start"
          align="center"
          gap={12}
          wrap
        >
          {canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              新增企业
            </Button>
          ) : null}
          <TableExportActions {...exportActions} />
        </Flex>
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            message="企业列表加载失败"
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
        rowSelection,
        columns,
        dataSource: enterprises,
        loading,
      }}
      scrollX={1200}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showTotal: () => `已选择 ${exportActions.selectedCount} 项 · 共 ${total} 条记录`,
      }}
    />
  )
}

export default EnterpriseTable
