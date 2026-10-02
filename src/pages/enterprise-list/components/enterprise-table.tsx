import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Table, Tag } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import type { EnterpriseListItemDto, EnterpriseStatus } from '../../../types/enterprise'
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
 * 企业列表表格，负责工具栏、状态反馈、列渲染和分页交互
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
  onCreate,
  onEdit,
  onRetry,
  onPageChange,
}: EnterpriseTableProps) {
  const navigate = useNavigate()

  const columns = useMemo<ColumnsType<EnterpriseListItemDto>>(
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
          <div className="enterprise-table-actions">
            <Button type="link" onClick={() => void navigate(`/enterprises/${record.id}`)}>
              查看
            </Button>
            {canUpdate ? (
              <Button type="link" onClick={() => onEdit(record.id)}>
                编辑
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canUpdate, navigate, onEdit, page, pageSize],
  )

  /**
   * 将 Ant Design 分页参数转换为页面所需状态
   */
  function handleTableChange(pagination: TablePaginationConfig) {
    const nextPageSize = pagination.pageSize ?? pageSize
    const nextPage = nextPageSize === pageSize ? (pagination.current ?? 1) : 1
    onPageChange(nextPage, nextPageSize)
  }

  return (
    <section className="enterprise-table-panel" aria-label="企业列表">
      <div className="enterprise-table-toolbar">
        {canCreate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            新增企业
          </Button>
        ) : <span />}
      </div>

      {loadError ? (
        <Alert
          type="error"
          showIcon
          message="企业列表加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : null}

      <Table<EnterpriseListItemDto>
        rowKey="id"
        columns={columns}
        dataSource={enterprises}
        loading={loading}
        scroll={{ x: 1200 }}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (count) => `共 ${count} 条记录`,
        }}
      />
    </section>
  )
}

export default EnterpriseTable
