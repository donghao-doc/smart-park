import {
  ArrowLeftOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Skeleton,
  Space,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { reqGetWorkOrder, reqGetWorkOrderOptions, reqUpdateWorkOrder, reqUpdateWorkOrderImages } from '@/api'
import WorkOrderImageUpload from '@/components/work-order-image-upload'
import WorkOrderActionModal from '@/pages/work-order-list/components/work-order-action-modal'
import { WorkOrderPriorityTag, WorkOrderStatusTag } from '@/pages/work-order-list/components/work-order-tag'
import { useUserStore } from '@/stores/user'
import type {
  WorkOrderAction,
  WorkOrderActionRequest,
  WorkOrderDto,
  WorkOrderImageDto,
  WorkOrderOptionsDto,
} from '@/types/work-order'
import { formatDateTime, maskPhoneNumber } from '@/utils'
import {
  canEditWorkOrderImages,
  getWorkOrderActions,
  workOrderActionLabels,
  workOrderTypeLabels,
} from '@/utils/work-order'
import WorkOrderEvaluation from './components/work-order-evaluation'
import WorkOrderHistory from './components/work-order-history'
import WorkOrderProgress from './components/work-order-progress'
import './work-order-detail.scss'

interface WorkOrderDetailContentProps {
  /** 路由中的工单唯一标识 */
  id: string
}

/** 加载并展示独立工单详情，统一保存流程操作、企业评价和现场图片 */
function WorkOrderDetailContent({ id }: WorkOrderDetailContentProps) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const currentUser = useUserStore((state) => state.currentUser)
  const permissions = currentUser?.role.permissions ?? []
  const [order, setOrder] = useState<WorkOrderDto>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [actionOrder, setActionOrder] = useState<WorkOrderDto>()
  const [action, setAction] = useState<WorkOrderAction>('accept')
  const [options, setOptions] = useState<WorkOrderOptionsDto>()
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState(false)
  const [optionsVersion, setOptionsVersion] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetWorkOrder(id)
        if (active) {
          setOrder(result)
          setLoadError(false)
        }
      } catch {
        if (active) setLoadError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id, reloadVersion])

  useEffect(() => {
    if (!actionOrder || (action !== 'accept' && action !== 'assign')) return
    let active = true
    void (async () => {
      try {
        const result = await reqGetWorkOrderOptions()
        if (active) {
          setOptions(result)
          setOptionsError(false)
        }
      } catch {
        if (active) setOptionsError(true)
      } finally {
        if (active) setOptionsLoading(false)
      }
    })()
    return () => { active = false }
  }, [action, actionOrder, optionsVersion])

  /** 重新读取详情，同步其他页面或账号产生的变更 */
  function handleReload() {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  /** 使用当前工单快照打开操作表单，分派时独立加载处理人 */
  function handleOpenAction(nextAction: WorkOrderAction) {
    if (!order) return
    setAction(nextAction)
    setActionOrder(order)
    if (nextAction === 'accept' || nextAction === 'assign') setOptionsLoading(true)
  }

  /** 操作成功后直接刷新详情，状态冲突时清除过期操作并重新读取 */
  async function handleActionSubmit(payload: WorkOrderActionRequest) {
    if (!order) return
    setSubmitting(true)
    try {
      const updated = await reqUpdateWorkOrder(order.id, payload)
      setOrder(updated)
      setActionOrder(undefined)
      void message.success(payload.action === 'confirm' ? '工单已确认完成' : '工单操作成功')
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 409100) {
        setActionOrder(undefined)
        handleReload()
      }
      // 其他接口异常由 HTTP 层展示，保留操作表单便于重试
    } finally {
      setSubmitting(false)
    }
  }

  /** 上传组件等待接口保存成功后解除锁定，失败时继续展示原有图片 */
  async function handleImagesChange(images: WorkOrderImageDto[]) {
    const updated = await reqUpdateWorkOrderImages(id, images)
    setOrder(updated)
    void message.success('现场图片已保存')
  }

  if (loading) return <Skeleton className="work-order-detail-loading" active paragraph={{ rows: 16 }} />

  if (loadError || !order) {
    return (
      <Alert
        type="error"
        showIcon
        title="工单详情加载失败"
        description="工单可能不存在，或当前账号无权查看"
        action={(
          <Space wrap>
            <Button onClick={handleReload}>重试</Button>
            <Button><Link to="/work-orders">返回工单中心</Link></Button>
          </Space>
        )}
      />
    )
  }

  const actions = getWorkOrderActions(order, permissions, currentUser?.id ?? '')
  const busy = submitting || imageBusy
  const canEditImages = canEditWorkOrderImages(order, permissions)

  return (
    <Flex className="work-order-detail-page" vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Flex align="center" gap={12} wrap>
          <h1 className="work-order-detail-title">{order.code} <span>{order.title}</span></h1>
          <WorkOrderStatusTag status={order.status} />
        </Flex>
        <Flex align="center" gap={8} wrap>
          <Button
            icon={<ArrowLeftOutlined />}
            disabled={busy}
            onClick={() => void navigate('/work-orders')}
          >
            返回工单中心
          </Button>
          <Button icon={<ReloadOutlined />} disabled={busy} onClick={handleReload}>刷新</Button>
          {actions.filter((item) => item !== 'confirm').map((item) => (
            <Button
              key={item}
              type={item === 'accept' || item === 'start' || item === 'submit' ? 'primary' : 'default'}
              danger={item === 'cancel'}
              disabled={busy}
              onClick={() => handleOpenAction(item)}
            >
              {workOrderActionLabels[item]}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Flex vertical gap={16}>
            <Card className="work-order-detail-card" title="工单信息">
              <Descriptions
                className="work-order-detail-information"
                bordered
                size="small"
                column={{ xs: 1, sm: 2 }}
                items={[
                  { key: 'code', label: '工单编号', children: order.code },
                  { key: 'creator', label: '提交人', children: order.creatorName },
                  { key: 'type', label: '工单类型', children: workOrderTypeLabels[order.type] },
                  { key: 'location', label: '问题位置', children: order.location },
                  { key: 'created', label: '创建时间', children: formatDateTime(order.createdAt) },
                  { key: 'status', label: '工单状态', children: <WorkOrderStatusTag status={order.status} /> },
                  { key: 'contact', label: '企业联系人', children: order.contactName },
                  { key: 'updated', label: '更新时间', children: formatDateTime(order.updatedAt) },
                ]}
              />
            </Card>
            <Card className="work-order-detail-card" title="问题描述">
              <p className="work-order-detail-description">{order.description}</p>
              <WorkOrderImageUpload
                value={order.images}
                disabled={!canEditImages || submitting}
                onChange={handleImagesChange}
                onBusyChange={setImageBusy}
              />
            </Card>
            <Card className="work-order-detail-card" title="处理记录">
              <WorkOrderHistory order={order} />
            </Card>
          </Flex>
        </Col>
        <Col xs={24} lg={10}>
          <Flex vertical gap={16}>
            <Card className="work-order-detail-card" title="当前状态">
              <WorkOrderProgress order={order} />
            </Card>
            <Card className="work-order-detail-card" title="相关信息">
              <Descriptions
                className="work-order-detail-related"
                column={1}
                items={[
                  {
                    key: 'enterprise',
                    label: <Space><BankOutlined />所属企业</Space>,
                    children: <Link to={`/enterprises/${order.enterpriseId}`}>{order.enterpriseName}</Link>,
                  },
                  {
                    key: 'contact',
                    label: <Space><UserOutlined />企业联系人</Space>,
                    children: (
                      <Flex align="center" gap={8} wrap>
                        <span>{order.contactName}</span>
                        <span>{maskPhoneNumber(order.contactPhone)}</span>
                        <Button
                          type="link"
                          icon={<PhoneOutlined />}
                          href={`tel:${order.contactPhone}`}
                          aria-label="拨打企业联系人电话"
                        />
                      </Flex>
                    ),
                  },
                  {
                    key: 'location',
                    label: <Space><EnvironmentOutlined />位置</Space>,
                    children: order.location,
                  },
                  {
                    key: 'priority',
                    label: <Space><ExclamationCircleOutlined />紧急程度</Space>,
                    children: <WorkOrderPriorityTag priority={order.priority} />,
                  },
                  {
                    key: 'assignee',
                    label: <Space><UserOutlined />处理人</Space>,
                    children: order.assigneeName ?? '尚未分派',
                  },
                ]}
              />
            </Card>
            <Card className="work-order-detail-card" title="企业确认与评价">
              <WorkOrderEvaluation
                key={`${order.id}-${order.status}`}
                order={order}
                canConfirm={actions.includes('confirm')}
                busy={busy}
                onConfirm={(rating, feedback) => void handleActionSubmit({
                  action: 'confirm',
                  expectedStatus: order.status,
                  rating,
                  remark: feedback,
                })}
              />
            </Card>
          </Flex>
        </Col>
      </Row>
      <WorkOrderActionModal
        order={actionOrder}
        action={action}
        options={options}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        submitting={submitting}
        onRetryOptions={() => {
          setOptionsLoading(true)
          setOptionsVersion((version) => version + 1)
        }}
        onSubmit={(payload) => void handleActionSubmit(payload)}
        onCancel={() => setActionOrder(undefined)}
      />
    </Flex>
  )
}

/** 工单详情路由入口，切换工单时重新初始化状态，避免展示上一条工单 */
function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  return id ? <WorkOrderDetailContent key={id} id={id} /> : null
}

export default WorkOrderDetailPage
