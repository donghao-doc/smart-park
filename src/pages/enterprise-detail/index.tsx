import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { Alert, App, Button, Skeleton, Table, Tabs, Tag, type TableColumnsType } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { reqGetEnterprise, reqUpdateEnterprise } from '@/api'
import { useUserStore } from '@/stores/user'
import type {
  EnterpriseDetailDto,
  EnterpriseMemberDto,
  EnterpriseMutationRequest,
  EnterpriseVehicleDto,
  EnterpriseWorkOrderDto,
} from '@/types/enterprise'
import EnterpriseFormModal from '@/pages/enterprise-list/components/enterprise-form-modal'
import EnterpriseInformation from './components/enterprise-information'
import './enterprise-detail.scss'

const memberColumns: TableColumnsType<EnterpriseMemberDto> = [
  { title: '姓名', dataIndex: 'name' },
  { title: '部门', dataIndex: 'department' },
  { title: '职务', dataIndex: 'title' },
  { title: '手机号', dataIndex: 'phone' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: EnterpriseMemberDto['status']) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>
        {status === 'active' ? '在职' : '离职'}
      </Tag>
    ),
  },
]

const vehicleColumns: TableColumnsType<EnterpriseVehicleDto> = [
  { title: '车牌号', dataIndex: 'plateNumber' },
  { title: '车辆类型', dataIndex: 'type' },
  { title: '车主', dataIndex: 'ownerName' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: EnterpriseVehicleDto['status']) => (
      <Tag color={status === 'active' ? 'success' : 'error'}>
        {status === 'active' ? '正常' : '停用'}
      </Tag>
    ),
  },
]

const workOrderColumns: TableColumnsType<EnterpriseWorkOrderDto> = [
  { title: '工单编号', dataIndex: 'code' },
  { title: '工单标题', dataIndex: 'title' },
  { title: '创建时间', dataIndex: 'createdAt', render: (value: string) => value.slice(0, 10) },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: EnterpriseWorkOrderDto['status']) => {
      const labels = { processing: '处理中', pending: '待处理', completed: '已完成' }
      const colors = { processing: 'processing', pending: 'warning', completed: 'success' }
      return <Tag color={colors[status]}>{labels[status]}</Tag>
    },
  },
]

/**
 * 企业详情页面，展示企业档案、关键指标和关联业务数据
 */
function EnterpriseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [enterprise, setEnterprise] = useState<EnterpriseDetailDto>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const canUpdate = useUserStore((state) => state.hasPermission('enterprise:update'))

  useEffect(() => {
    let active = true
    if (!id) {
      return () => {
        active = false
      }
    }

    void (async () => {
      try {
        const detail = await reqGetEnterprise(id)
        if (active) {
          setEnterprise(detail)
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
  }, [id])

  /**
   * 保存企业编辑结果并直接刷新详情内容
   */
  async function handleUpdate(values: EnterpriseMutationRequest) {
    if (!enterprise) {
      return
    }

    setSubmitting(true)
    try {
      const updated = await reqUpdateEnterprise(enterprise.id, values)
      setEnterprise(updated)
      setEditing(false)
      void message.success('企业信息已更新')
    } catch {
      // 接口错误由统一 HTTP 层展示，弹窗保持打开便于修正
    } finally {
      setSubmitting(false)
    }
  }

  if (!id || loadError) {
    return (
      <Alert
        type="error"
        showIcon
        message="企业详情加载失败"
        description="企业可能不存在，或当前账号无权访问该企业"
        action={<Button><Link to="/enterprises">返回企业列表</Link></Button>}
      />
    )
  }

  if (loading) {
    return <Skeleton active className="enterprise-detail-loading" paragraph={{ rows: 18 }} />
  }

  if (!enterprise) {
    return (
      <Alert
        type="error"
        showIcon
        message="企业详情加载失败"
        description="企业可能不存在，或当前账号无权访问该企业"
        action={<Button><Link to="/enterprises">返回企业列表</Link></Button>}
      />
    )
  }

  return (
    <div className="enterprise-detail-page">
      <Button
        type="text"
        className="enterprise-detail-back-button"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/enterprises')}
      >
        返回企业管理
      </Button>

      <header className="enterprise-detail-header">
        <div>
          <div className="enterprise-detail-title-row">
            <h1>{enterprise.name}</h1>
            <Tag className={`enterprise-detail-status is-${enterprise.status}`} variant="filled">
              {enterprise.status === 'active' ? '已入驻' : '已停用'}
            </Tag>
          </div>
          <p>{enterprise.description}</p>
        </div>
        {canUpdate ? (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
            编辑
          </Button>
        ) : null}
      </header>

      <Tabs
        className="enterprise-detail-tabs"
        defaultActiveKey="information"
        items={[
          {
            key: 'information',
            label: '企业信息',
            children: <EnterpriseInformation enterprise={enterprise} />,
          },
          {
            key: 'members',
            label: `成员 ${enterprise.members.length}`,
            children: (
              <section className="enterprise-detail-panel enterprise-related-panel">
                <Table rowKey="id" columns={memberColumns} dataSource={enterprise.members} pagination={false} />
              </section>
            ),
          },
          {
            key: 'vehicles',
            label: `车辆 ${enterprise.vehicles.length}`,
            children: (
              <section className="enterprise-detail-panel enterprise-related-panel">
                <Table rowKey="id" columns={vehicleColumns} dataSource={enterprise.vehicles} pagination={false} />
              </section>
            ),
          },
          {
            key: 'workOrders',
            label: `关联工单 ${enterprise.workOrders.length}`,
            children: (
              <section className="enterprise-detail-panel enterprise-related-panel">
                <Table rowKey="id" columns={workOrderColumns} dataSource={enterprise.workOrders} pagination={false} />
              </section>
            ),
          },
        ]}
      />

      <EnterpriseFormModal
        open={editing}
        enterprise={enterprise}
        submitting={submitting}
        onSubmit={(values) => void handleUpdate(values)}
        onCancel={() => setEditing(false)}
      />
    </div>
  )
}

export default EnterpriseDetailPage
