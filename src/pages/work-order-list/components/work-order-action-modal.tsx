import { Alert, Button, Form, Input, Rate, Select } from 'antd'
import { useEffect } from 'react'

import ScrollableModal from '@/components/scrollable-modal'
import type {
  WorkOrderAction,
  WorkOrderActionRequest,
  WorkOrderDto,
  WorkOrderOptionsDto,
} from '@/types/work-order'
import { workOrderActionLabels } from '@/utils/work-order'
import './work-order-action-modal.scss'

interface WorkOrderActionModalProps {
  /** 当前操作的工单，未选择时关闭弹窗 */
  order?: WorkOrderDto
  /** 当前流程动作 */
  action: WorkOrderAction
  /** 可分派的账号选项 */
  options?: WorkOrderOptionsDto
  /** 是否正在加载分派选项 */
  optionsLoading: boolean
  /** 分派选项是否加载失败 */
  optionsError: boolean
  /** 是否正在提交工单操作 */
  submitting: boolean
  /** 重新请求选项 */
  onRetryOptions: () => void
  /** 提交工单流程参数 */
  onSubmit: (payload: WorkOrderActionRequest) => void
  /** 关闭操作表单 */
  onCancel: () => void
}

/** 收集分派、处理说明及企业评价，提交前由表单校验必填信息 */
function WorkOrderActionModal({
  order,
  action,
  options,
  optionsLoading,
  optionsError,
  submitting,
  onRetryOptions,
  onSubmit,
  onCancel,
}: WorkOrderActionModalProps) {
  const [form] = Form.useForm<WorkOrderActionRequest>()
  const assigning = action === 'accept' || action === 'assign'
  const remarkRequired = action === 'submit' || action === 'cancel' || action === 'reopen'

  useEffect(() => {
    if (!order) return
    form.resetFields()
    form.setFieldsValue({ assigneeId: order.assigneeId ?? undefined })
  }, [action, form, order])

  /** 使用打开弹窗时的状态提交，后端会拒绝已失效的状态操作 */
  function handleFinish(values: WorkOrderActionRequest) {
    if (!order) return
    onSubmit({
      action,
      expectedStatus: order.status,
      assigneeId: assigning ? values.assigneeId : undefined,
      remark: values.remark?.trim(),
      rating: action === 'confirm' && values.rating ? values.rating : undefined,
    })
  }

  return (
    <ScrollableModal
      className="work-order-action-modal"
      title={workOrderActionLabels[action]}
      open={Boolean(order)}
      width={560}
      okText={workOrderActionLabels[action]}
      cancelText="返回"
      confirmLoading={submitting}
      okButtonProps={{
        danger: action === 'cancel',
        disabled: assigning && (optionsLoading || optionsError),
      }}
      cancelButtonProps={{ disabled: submitting }}
      closable={!submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <p className="work-order-action-subject">
        {order?.code} · {order?.title}
      </p>
      <Form
        name="work-order-action"
        form={form}
        layout="vertical"
        disabled={submitting}
        onFinish={handleFinish}
      >
        {assigning ? (
          <>
            {optionsError ? (
              <Alert
                className="work-order-action-feedback"
                type="error"
                showIcon
                title="处理人选项加载失败"
                action={
                  <Button size="small" onClick={onRetryOptions}>
                    重试
                  </Button>
                }
              />
            ) : null}
            <Form.Item
              name="assigneeId"
              label="处理人"
              rules={[{ required: true, message: '请选择处理人' }]}
            >
              <Select
                placeholder="请选择工单处理人"
                options={options?.assignees.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                loading={optionsLoading}
              />
            </Form.Item>
          </>
        ) : null}
        {action === 'confirm' ? (
          <>
            <Alert type="info" showIcon title="确认后工单将进入已完成状态，可同时评价服务质量" />
            <Form.Item name="rating" label="服务评价（可选）" className="work-order-action-rating">
              <Rate aria-label="服务评价，1 至 5 分" />
            </Form.Item>
          </>
        ) : null}
        <Form.Item
          name="remark"
          label={
            action === 'submit' ? '处理结果说明' : action === 'confirm' ? '评价反馈' : '操作说明'
          }
          rules={[
            {
              required: remarkRequired,
              whitespace: true,
              message: '请填写具体说明',
            },
            { max: 1000 },
          ]}
        >
          <Input.TextArea
            rows={4}
            showCount
            maxLength={1000}
            placeholder={remarkRequired ? '请填写具体说明' : '可填写补充说明'}
          />
        </Form.Item>
      </Form>
    </ScrollableModal>
  )
}

export default WorkOrderActionModal
