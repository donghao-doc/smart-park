import { Alert, Button, Col, Form, Input, Row, Select } from 'antd'
import { useEffect } from 'react'

import ScrollableModal from '@/components/scrollable-modal'
import type { WorkOrderCreateRequest, WorkOrderOptionsDto } from '@/types/work-order'
import { workOrderPriorityLabels, workOrderTypeLabels } from '@/utils/work-order'
import './work-order-create-modal.scss'

interface WorkOrderCreateModalProps {
  /** 创建弹窗是否打开 */
  open: boolean
  /** 创建所需的完整可选数据 */
  options?: WorkOrderOptionsDto
  /** 企业用户的固定企业标识 */
  lockedEnterpriseId?: string
  /** 是否正在加载企业选项 */
  optionsLoading: boolean
  /** 企业选项是否加载失败 */
  optionsError: boolean
  /** 是否正在提交创建请求 */
  submitting: boolean
  /** 重新加载表单选项 */
  onRetryOptions: () => void
  /** 提交创建资料 */
  onSubmit: (payload: WorkOrderCreateRequest) => void
  /** 关闭创建弹窗 */
  onCancel: () => void
}

/** 创建工单表单，代企业创建时指定确认联系人，长表单仅在内容区滚动 */
function WorkOrderCreateModal({
  open,
  options,
  lockedEnterpriseId,
  optionsLoading,
  optionsError,
  submitting,
  onRetryOptions,
  onSubmit,
  onCancel,
}: WorkOrderCreateModalProps) {
  const [form] = Form.useForm<WorkOrderCreateRequest>()

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue({
      type: 'repair',
      priority: 'medium',
      imageNames: [],
      enterpriseId: lockedEnterpriseId,
    })
  }, [form, lockedEnterpriseId, open])

  useEffect(() => {
    if (!open || !lockedEnterpriseId) return
    const enterprise = options?.enterprises.find((item) => item.id === lockedEnterpriseId)
    if (enterprise) {
      // 选项晚于弹窗加载时仅补充联系人，保留用户已输入的工单内容
      if (!form.getFieldValue('contactName')) form.setFieldValue('contactName', enterprise.contactName)
      if (!form.getFieldValue('contactPhone')) form.setFieldValue('contactPhone', enterprise.contactPhone)
    }
  }, [form, lockedEnterpriseId, open, options])

  /** 切换企业后回填该企业的默认联系人，仍允许按实际负责人修改 */
  function handleEnterpriseChange(id: string) {
    const enterprise = options?.enterprises.find((item) => item.id === id)
    form.setFieldsValue({ contactName: enterprise?.contactName, contactPhone: enterprise?.contactPhone })
  }

  return (
    <ScrollableModal
      className="work-order-create-modal"
      title="创建工单"
      open={open}
      width={720}
      okText="创建工单"
      cancelText="取消"
      confirmLoading={submitting}
      okButtonProps={{ disabled: optionsLoading || optionsError }}
      cancelButtonProps={{ disabled: submitting }}
      closable={!submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <Form
        name="work-order-create"
        form={form}
        layout="vertical"
        disabled={submitting}
        onFinish={onSubmit}
      >
        {optionsError ? (
          <Alert
            className="work-order-create-feedback"
            type="error"
            showIcon
            title="企业选项加载失败，请重试后创建工单"
            action={<Button size="small" onClick={onRetryOptions}>重试</Button>}
          />
        ) : null}
        <Form.Item
          name="title"
          label="工单标题"
          rules={[{ required: true, whitespace: true, message: '请输入工单标题' }, { max: 60 }]}
        >
          <Input placeholder="简要描述需要解决的问题" maxLength={60} />
        </Form.Item>
        <Row gutter={20}>
          <Col xs={24} md={12}>
            <Form.Item name="type" label="工单类型" rules={[{ required: true }]}>
              <Select
                options={Object.entries(workOrderTypeLabels).map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="priority" label="紧急程度" rules={[{ required: true }]}>
              <Select
                options={Object.entries(workOrderPriorityLabels).map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true, message: '请选择所属企业' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="请选择所属企业"
                disabled={submitting || Boolean(lockedEnterpriseId)}
                loading={optionsLoading}
                options={options?.enterprises.map((item) => ({ value: item.id, label: item.name }))}
                onChange={handleEnterpriseChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactName"
              label="企业联系人"
              tooltip="由该企业联系人负责确认处理结果"
              rules={[{ required: true, whitespace: true, message: '请输入企业联系人' }, { max: 30 }]}
            >
              <Input maxLength={30} placeholder="请输入结果确认联系人" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[{ required: true }, { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号' }]}
            >
              <Input maxLength={11} placeholder="请输入联系人手机号" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="location"
          label="问题位置"
          rules={[{ required: true, whitespace: true, message: '请输入问题位置' }, { max: 100 }]}
        >
          <Input maxLength={100} placeholder="如 A栋3层301会议室" />
        </Form.Item>
        <Form.Item
          name="description"
          label="问题描述"
          rules={[{ required: true, whitespace: true, message: '请输入问题描述' }, { max: 1000 }]}
        >
          <Input.TextArea rows={3} maxLength={1000} showCount placeholder="请描述问题现象和需要的协助" />
        </Form.Item>
        <Form.Item
          name="imageNames"
          label="图片占位"
          extra="演示附件：输入图片名称后按回车添加，最多 5 个，不上传真实文件"
          rules={[{
            validator: async (_rule, names: string[] = []) => {
              if (names.length > 5 || names.some((name) => !name.trim() || name.length > 80)) {
                throw new Error('最多添加 5 个图片名称，每个名称不超过 80 字')
              }
            },
          }]}
        >
          <Select mode="tags" placeholder="例如：现场照片.jpg" open={false} />
        </Form.Item>
      </Form>
    </ScrollableModal>
  )
}

export default WorkOrderCreateModal
