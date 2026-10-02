import {
  ApartmentOutlined,
  BarChartOutlined,
  CarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Alert, App, Button, Descriptions, Skeleton, Table, Tabs, Tag, Timeline } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'

import { reqGetEnterprise, reqUpdateEnterprise } from '../../api/enterprises'
import { useUserStore } from '../../stores/user'
import type {
  EnterpriseDetailDto,
  EnterpriseMemberDto,
  EnterpriseMutationRequest,
  EnterpriseVehicleDto,
  EnterpriseWorkOrderDto,
} from '../../types/enterprise'
import EnterpriseFormModal from '../enterprise-list/components/enterprise-form-modal'
import './enterprise-detail.scss'

/**
 * 将 ISO 时间格式化为详情页时间文本
 */
function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
    .format(new Date(value))
    .replace('/', '-')
}

const memberColumns: ColumnsType<EnterpriseMemberDto> = [
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

const vehicleColumns: ColumnsType<EnterpriseVehicleDto> = [
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

const workOrderColumns: ColumnsType<EnterpriseWorkOrderDto> = [
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

  const informationContent = useMemo(() => {
    if (!enterprise) {
      return null
    }

    return (
      <div className="enterprise-detail-grid">
        <div className="enterprise-detail-main-column">
          <section className="enterprise-detail-panel enterprise-basic-panel">
            <h2><ApartmentOutlined />基本信息</h2>
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              colon={false}
              items={[
                { key: 'name', label: '企业名称', children: enterprise.name },
                { key: 'creditCode', label: '统一社会信用代码', children: enterprise.creditCode },
                { key: 'companyType', label: '企业类型', children: enterprise.companyType },
                { key: 'foundedAt', label: '成立日期', children: enterprise.foundedAt },
                { key: 'capital', label: '注册资本', children: enterprise.registeredCapital },
                { key: 'industry', label: '所属行业', children: enterprise.industry },
                { key: 'scope', label: '经营范围', span: { xs: 1, sm: 1, md: 2 }, children: enterprise.businessScope },
                { key: 'description', label: '企业简介', span: { xs: 1, sm: 1, md: 2 }, children: enterprise.description },
              ]}
            />
          </section>

          <section className="enterprise-detail-panel enterprise-contact-panel">
            <h2><TeamOutlined />联系人信息</h2>
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              colon={false}
              items={[
                { key: 'contactName', label: '联系人', children: enterprise.contact.name },
                { key: 'title', label: '职务', children: enterprise.contact.title },
                { key: 'phone', label: '手机号码', children: enterprise.contact.phone },
                { key: 'email', label: '邮箱', children: enterprise.contact.email },
                { key: 'telephone', label: '座机电话', children: enterprise.contact.telephone },
                { key: 'address', label: '联系地址', children: enterprise.contact.address },
              ]}
            />
          </section>
        </div>

        <aside className="enterprise-detail-side-column">
          <section className="enterprise-detail-panel enterprise-metrics-panel">
            <h2><BarChartOutlined />关键数据</h2>
            <div className="enterprise-metric-grid">
              <article>
                <span className="enterprise-metric-icon is-cyan"><TeamOutlined /></span>
                <div><span>企业成员</span><strong>{enterprise.metrics.memberCount}<small> 人</small></strong></div>
              </article>
              <article>
                <span className="enterprise-metric-icon is-purple"><CarOutlined /></span>
                <div><span>备案车辆</span><strong>{enterprise.metrics.vehicleCount}<small> 辆</small></strong></div>
              </article>
              <article>
                <span className="enterprise-metric-icon is-green"><FileTextOutlined /></span>
                <div><span>关联工单</span><strong>{enterprise.metrics.workOrderCount}<small> 件</small></strong></div>
              </article>
              <article>
                <span className="enterprise-metric-icon is-blue"><ApartmentOutlined /></span>
                <div><span>入驻时长</span><strong className="is-duration">{enterprise.metrics.tenancyDuration}</strong><small>自 {enterprise.foundedAt}</small></div>
              </article>
            </div>
          </section>

          <section className="enterprise-detail-panel enterprise-office-panel">
            <h2><EnvironmentOutlined />办公位置</h2>
            <Descriptions
              column={1}
              colon={false}
              items={[
                { key: 'park', label: '园区', children: enterprise.office.parkName },
                { key: 'building', label: '楼宇', children: enterprise.office.buildingName },
                { key: 'floor', label: '楼层', children: enterprise.office.floorName },
                { key: 'room', label: '办公区域', children: enterprise.office.roomName },
                { key: 'address', label: '详细地址', children: enterprise.office.address },
              ]}
            />
          </section>
        </aside>

        <section className="enterprise-detail-panel enterprise-activity-panel">
          <div className="enterprise-panel-heading">
            <h2><ClockCircleOutlined />最近动态</h2>
            <Button type="link">查看更多</Button>
          </div>
          <Timeline
            items={enterprise.activities.map((activity) => ({
              color: '#1677ff',
              content: (
                <div className="enterprise-activity-item">
                  <time>{formatActivityTime(activity.occurredAt)}</time>
                  <span>{activity.content}</span>
                </div>
              ),
            }))}
          />
        </section>
      </div>
    )
  }, [enterprise])

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
          { key: 'information', label: '企业信息', children: informationContent },
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
