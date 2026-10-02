import { Form, Input, InputNumber, Modal } from 'antd'
import { useEffect } from 'react'

import type { ParkInfoDto, UpdateParkInfoRequest } from '../../../types/park-profile'
import './park-profile-edit-modal.scss'

interface ParkProfileEditModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 当前园区基础信息 */
  info: ParkInfoDto
  /** 是否正在提交表单 */
  submitting: boolean
  /** 提交园区基础信息 */
  onSubmit: (values: UpdateParkInfoRequest) => void | Promise<void>
  /** 关闭编辑弹窗 */
  onCancel: () => void
}

/**
 * 编辑并提交园区基础信息
 */
function ParkProfileEditModal({
  open,
  info,
  submitting,
  onSubmit,
  onCancel,
}: ParkProfileEditModalProps) {
  const [form] = Form.useForm<UpdateParkInfoRequest>()

  useEffect(() => {
    if (open) {
      form.setFieldsValue(info)
    }
  }, [form, info, open])

  return (
    <Modal
      title="编辑园区信息"
      open={open}
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={() => form.submit()}
      onCancel={onCancel}
      forceRender
    >
      <Form<UpdateParkInfoRequest>
        form={form}
        layout="vertical"
        className="park-profile-form"
        onFinish={onSubmit}
      >
        <Form.Item
          label="园区名称"
          name="name"
          rules={[{ required: true, whitespace: true, message: '请输入园区名称' }]}
        >
          <Input maxLength={40} />
        </Form.Item>
        <Form.Item
          label="园区地址"
          name="address"
          rules={[{ required: true, whitespace: true, message: '请输入园区地址' }]}
        >
          <Input maxLength={80} />
        </Form.Item>
        <div className="park-profile-form-row">
          <Form.Item
            label="联系人"
            name="contactName"
            rules={[{ required: true, whitespace: true, message: '请输入联系人' }]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item
            label="联系电话"
            name="contactPhone"
            rules={[{ required: true, whitespace: true, message: '请输入联系电话' }]}
          >
            <Input maxLength={30} />
          </Form.Item>
        </div>
        <Form.Item
          label="园区面积（㎡）"
          name="area"
          rules={[{ required: true, message: '请输入园区面积' }]}
        >
          <InputNumber min={1} precision={0} className="park-profile-area-input" />
        </Form.Item>
        <Form.Item
          label="园区介绍"
          name="description"
          rules={[{ required: true, whitespace: true, message: '请输入园区介绍' }]}
        >
          <Input.TextArea rows={4} maxLength={240} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ParkProfileEditModal
