import { PlusOutlined } from '@ant-design/icons'
import { Alert, App, Button, Table, Tag } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  reqCreateEnterprise,
  reqGetEnterprise,
  reqGetEnterprises,
  reqUpdateEnterprise,
} from '../../api/enterprises'
import { useUserStore } from '../../stores/user'
import type {
  EnterpriseDetailDto,
  EnterpriseListItemDto,
  EnterpriseMutationRequest,
  EnterpriseStatus,
} from '../../types/enterprise'
import EnterpriseFilter from './components/enterprise-filter'
import type { EnterpriseFilterValues } from './components/enterprise-filter'
import EnterpriseFormModal from './components/enterprise-form-modal'
import './enterprise-list.scss'

const DEFAULT_PAGE_SIZE = 10

/**
 * 企业管理页面，提供筛选、分页、新增、查看和编辑入口
 */
function EnterpriseListPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [enterprises, setEnterprises] = useState<EnterpriseListItemDto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<EnterpriseFilterValues>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEnterprise, setEditingEnterprise] = useState<EnterpriseDetailDto>()
  const [submitting, setSubmitting] = useState(false)
  const canCreate = useUserStore((state) => state.hasPermission('enterprise:create'))
  const canUpdate = useUserStore((state) => state.hasPermission('enterprise:update'))

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetEnterprises({
          page,
          pageSize,
          keyword: filters.keyword?.trim() || undefined,
          status: filters.status,
        })
        if (active) {
          setEnterprises(result.list)
          setTotal(result.total)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setLoadError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [filters, page, pageSize, reloadVersion])

  /**
   * 打开编辑弹窗前加载完整企业详情
   */
  async function handleOpenEdit(enterpriseId: string) {
    try {
      const detail = await reqGetEnterprise(enterpriseId)
      setEditingEnterprise(detail)
      setFormOpen(true)
    } catch {
      // 接口错误由统一 HTTP 层展示
    }
  }

  /**
   * 新增或更新企业并刷新当前页数据
   */
  async function handleSubmit(values: EnterpriseMutationRequest) {
    setSubmitting(true)
    try {
      if (editingEnterprise) {
        await reqUpdateEnterprise(editingEnterprise.id, values)
        void message.success('企业信息已更新')
      } else {
        await reqCreateEnterprise(values)
        setPage(1)
        void message.success('企业创建成功')
      }
      setFormOpen(false)
      setEditingEnterprise(undefined)
      setLoading(true)
      setReloadVersion((version) => version + 1)
    } catch {
      // 接口错误由统一 HTTP 层展示，弹窗保持打开便于用户修正
    } finally {
      setSubmitting(false)
    }
  }

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
              <Button type="link" onClick={() => void handleOpenEdit(record.id)}>
                编辑
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canUpdate, navigate, page, pageSize],
  )

  /**
   * 同步分页器状态，改变每页条数时回到第一页
   */
  function handleTableChange(pagination: TablePaginationConfig) {
    const nextPageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE
    setLoading(true)
    setPageSize(nextPageSize)
    setPage(nextPageSize === pageSize ? (pagination.current ?? 1) : 1)
  }

  /**
   * 应用企业筛选条件并从第一页重新加载数据
   */
  function handleFilterSearch(values: EnterpriseFilterValues) {
    setLoading(true)
    setPage(1)
    setFilters(values)
  }

  return (
    <div className="enterprise-list-page">
      {/* 企业筛选 */}
      <EnterpriseFilter onSearch={handleFilterSearch} />

      <section className="enterprise-table-panel">
        <div className="enterprise-table-toolbar">
          {canCreate ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingEnterprise(undefined)
                setFormOpen(true)
              }}
            >
              新增企业
            </Button>
          ) : <span />}
        </div>

        {loadError ? (
          <Alert
            type="error"
            showIcon
            message="企业列表加载失败"
            action={(
              <Button
                size="small"
                onClick={() => {
                  setLoading(true)
                  setReloadVersion((version) => version + 1)
                }}
              >
                重试
              </Button>
            )}
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

      <EnterpriseFormModal
        open={formOpen}
        enterprise={editingEnterprise}
        submitting={submitting}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={() => {
          setFormOpen(false)
          setEditingEnterprise(undefined)
        }}
      />
    </div>
  )
}

export default EnterpriseListPage
