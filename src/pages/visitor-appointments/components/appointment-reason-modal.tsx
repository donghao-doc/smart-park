import { Form, Input, Modal } from 'antd'
import { useEffect } from 'react'

import type { VisitorAppointmentDto } from '@/types/visitor-appointment'

interface AppointmentReasonFormValues {
  /** 驳回或取消原因 */
  reason: string
}

interface AppointmentReasonModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 当前操作类型 */
  action: 'reject' | 'cancel'
  /** 当前操作的预约 */
  appointment?: VisitorAppointmentDto
  /** 是否正在提交 */
  submitting: boolean
  /** 提交流程终止原因 */
  onSubmit: (reason: string) => void
  /** 关闭弹窗 */
  onCancel: () => void
}

/**
 * 收集预约驳回或取消原因
 */
function AppointmentReasonModal({
  open,
  action,
  appointment,
  submitting,
  onSubmit,
  onCancel,
}: AppointmentReasonModalProps) {
  const [form] = Form.useForm<AppointmentReasonFormValues>()
  const isReject = action === 'reject'

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [form, open])

  return (
    <Modal
      open={open}
      title={`${isReject ? '驳回' : '取消'}预约${appointment ? ` · ${appointment.visitorName}` : ''}`}
      okText={isReject ? '确认驳回' : '确认取消'}
      cancelText="返回"
      okButtonProps={{ danger: true }}
      confirmLoading={submitting}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => void form.validateFields().then((values) => onSubmit(values.reason))}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label={isReject ? '驳回原因' : '取消原因'}
          rules={[{ required: true, whitespace: true, message: '请填写原因' }, { max: 100 }]}
        >
          <Input.TextArea rows={4} showCount maxLength={100} placeholder="请输入具体原因" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AppointmentReasonModal
