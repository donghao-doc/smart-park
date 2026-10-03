import { Col, Form, Input, Modal, Row, Select, type SelectProps } from 'antd'
import { useEffect } from 'react'

import type { PersonnelDto, PersonnelMutationRequest } from '../../../types/personnel'
import './personnel-form-modal.scss'

interface PersonnelFormModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 编辑模式下的人员数据，未传入时为新增模式 */
  personnel?: PersonnelDto
  /** 可供选择的企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 表单是否正在提交 */
  submitting: boolean
  /** 提交人员表单 */
  onSubmit: (values: PersonnelMutationRequest) => void
  /** 关闭表单弹窗 */
  onCancel: () => void
}

const certificateTypeOptions = [
  { label: '身份证', value: 'identity_card' },
  { label: '护照', value: 'passport' },
  { label: '港澳通行证', value: 'hk_macao_permit' },
]

const statusOptions = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'resigned' },
  { label: '停用', value: 'suspended' },
]

/**
 * 人员新增与编辑共用表单弹窗
 */
function PersonnelFormModal({
  open,
  personnel,
  enterpriseOptions,
  submitting,
  onSubmit,
  onCancel,
}: PersonnelFormModalProps) {
  const [form] = Form.useForm<PersonnelMutationRequest>()

  useEffect(() => {
    if (!open) {
      return
    }

    if (personnel) {
      form.setFieldsValue({
        name: personnel.name,
        phone: personnel.phone,
        certificateType: personnel.certificateType,
        certificateNumber: personnel.certificateNumber,
        employeeNumber: personnel.employeeNumber,
        enterpriseId: personnel.enterpriseId,
        department: personnel.department,
        status: personnel.status,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({ certificateType: 'identity_card', status: 'active' })
  }, [form, open, personnel])

  return (
    <Modal
      className="personnel-form-modal"
      open={open}
      title={personnel ? '编辑人员' : '新增人员'}
      okText={personnel ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      width={720}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => void form.validateFields().then(onSubmit)}
    >
      <Form form={form} layout="vertical" requiredMark>
        <Row gutter={20}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }, { max: 30 }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="certificateType" label="证件类型" rules={[{ required: true }]}>
              <Select options={certificateTypeOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="certificateNumber"
              label="证件号码"
              rules={[{ required: true, message: '请输入证件号码' }]}
            >
              <Input placeholder="请输入证件号码" maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="employeeNumber"
              label="工号"
              rules={[{ required: true, message: '请输入工号' }]}
            >
              <Input placeholder="请输入工号" maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="请选择所属企业"
                options={enterpriseOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="department"
              label="部门"
              rules={[{ required: true, message: '请输入所属部门' }]}
            >
              <Input placeholder="请输入所属部门" maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={statusOptions} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default PersonnelFormModal
