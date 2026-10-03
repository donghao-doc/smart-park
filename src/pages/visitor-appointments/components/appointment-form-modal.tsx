import { DatePicker, Form, Input, Modal, Select, type SelectProps } from 'antd'
import { useEffect, useMemo } from 'react'

import type { PersonnelDto } from '@/types/personnel'
import type { CreateVisitorAppointmentRequest } from '@/types/visitor-appointment'

const { RangePicker } = DatePicker
const { TextArea } = Input

interface DateTimeValue {
  /** 转换为 ISO 8601 时间 */
  toISOString: () => string
}

interface AppointmentFormValues {
  /** 访客姓名 */
  visitorName: string
  /** 访客手机号 */
  visitorPhone: string
  /** 所属企业标识 */
  enterpriseId: string
  /** 受访人员标识 */
  hostId: string
  /** 预约起止时间 */
  visitTime: [DateTimeValue, DateTimeValue]
  /** 访问事由 */
  visitReason: string
  /** 访客车牌号 */
  plateNumber?: string
}

interface AppointmentFormModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 可选的在职人员 */
  personnel: PersonnelDto[]
  /** 当前角色是否只能选择所属企业 */
  enterpriseLocked: boolean
  /** 默认所属企业标识 */
  defaultEnterpriseId?: string
  /** 表单是否正在提交 */
  submitting: boolean
  /** 提交创建预约数据 */
  onSubmit: (values: CreateVisitorAppointmentRequest) => void
  /** 关闭创建预约弹窗 */
  onCancel: () => void
}

/**
 * 创建访客预约表单弹窗
 */
function AppointmentFormModal({
  open,
  enterpriseOptions,
  personnel,
  enterpriseLocked,
  defaultEnterpriseId,
  submitting,
  onSubmit,
  onCancel,
}: AppointmentFormModalProps) {
  const [form] = Form.useForm<AppointmentFormValues>()
  const selectedEnterpriseId = Form.useWatch('enterpriseId', form)
  const hostOptions = useMemo(
    () => personnel
      .filter((person) => person.enterpriseId === selectedEnterpriseId && person.status === 'active')
      .map((person) => ({ label: `${person.name} · ${person.department}`, value: person.id })),
    [personnel, selectedEnterpriseId],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    form.resetFields()
    if (defaultEnterpriseId) {
      form.setFieldValue('enterpriseId', defaultEnterpriseId)
    }
  }, [defaultEnterpriseId, form, open])

  /**
   * 校验表单并转换为接口提交结构
   */
  async function handleSubmit() {
    const values = await form.validateFields()
    onSubmit({
      visitorName: values.visitorName,
      visitorPhone: values.visitorPhone,
      enterpriseId: values.enterpriseId,
      hostId: values.hostId,
      scheduledStartAt: values.visitTime[0].toISOString(),
      scheduledEndAt: values.visitTime[1].toISOString(),
      visitReason: values.visitReason,
      plateNumber: values.plateNumber,
    })
  }

  return (
    <Modal
      className="appointment-form-modal"
      open={open}
      title="创建访客预约"
      okText="创建预约"
      cancelText="取消"
      width={720}
      confirmLoading={submitting}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => void handleSubmit()}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div className="appointment-form-grid">
          <Form.Item
            name="visitorName"
            label="访客姓名"
            rules={[{ required: true, whitespace: true, message: '请输入访客姓名' }, { max: 30 }]}
          >
            <Input placeholder="请输入访客姓名" />
          </Form.Item>
          <Form.Item
            name="visitorPhone"
            label="访客手机号"
            rules={[
              { required: true, message: '请输入访客手机号' },
              { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号码' },
            ]}
          >
            <Input placeholder="请输入访客手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true, message: '请选择所属企业' }]}>
            <Select
              showSearch
              disabled={enterpriseLocked}
              optionFilterProp="label"
              placeholder="请选择所属企业"
              options={enterpriseOptions}
              onChange={() => form.setFieldValue('hostId', undefined)}
            />
          </Form.Item>
          <Form.Item name="hostId" label="受访人" rules={[{ required: true, message: '请选择受访人' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              disabled={!selectedEnterpriseId}
              placeholder={selectedEnterpriseId ? '请选择受访人' : '请先选择所属企业'}
              options={hostOptions}
            />
          </Form.Item>
          <Form.Item
            className="appointment-form-full"
            name="visitTime"
            label="预约时间"
            rules={[{ required: true, message: '请选择预约起止时间' }]}
          >
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              className="appointment-form-range"
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
          <Form.Item
            className="appointment-form-full"
            name="visitReason"
            label="访问事由"
            rules={[{ required: true, whitespace: true, message: '请输入访问事由' }, { max: 100 }]}
          >
            <TextArea rows={3} showCount maxLength={100} placeholder="请输入访问事由" />
          </Form.Item>
          <Form.Item
            name="plateNumber"
            label="车牌号"
            rules={[{ pattern: /^[\u4e00-\u9fa5][A-Za-z][A-Za-z0-9]{5,6}$/, message: '请输入有效的车牌号' }]}
          >
            <Input placeholder="选填，例如 浙A12345" maxLength={8} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default AppointmentFormModal
