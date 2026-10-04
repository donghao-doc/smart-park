import { Form, Input, Modal, Select } from 'antd'
import { useEffect } from 'react'

import type { EnterpriseDetailDto, EnterpriseMutationRequest } from '@/types/enterprise'
import './enterprise-form-modal.scss'

interface EnterpriseFormModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 编辑模式下的企业数据，未传入时为新增模式 */
  enterprise?: EnterpriseDetailDto
  /** 表单是否正在提交 */
  submitting: boolean
  /** 提交企业表单 */
  onSubmit: (values: EnterpriseMutationRequest) => void
  /** 关闭表单弹窗 */
  onCancel: () => void
}

const industryOptions = [
  '信息技术',
  '节能环保',
  '智能制造',
  '文化传媒',
  '物流仓储',
  '大数据',
  '人工智能',
  '生物医药',
  '建筑设计',
  '教育科技',
].map((value) => ({ label: value, value }))

/**
 * 企业新增与编辑共用表单弹窗
 */
function EnterpriseFormModal({
  open,
  enterprise,
  submitting,
  onSubmit,
  onCancel,
}: EnterpriseFormModalProps) {
  const [form] = Form.useForm<EnterpriseMutationRequest>()

  useEffect(() => {
    if (!open) {
      return
    }

    if (enterprise) {
      form.setFieldsValue({
        name: enterprise.name,
        creditCode: enterprise.creditCode,
        industry: enterprise.industry,
        companyType: enterprise.companyType,
        contactName: enterprise.contactName,
        contactPhone: enterprise.contactPhone,
        officeLocation: enterprise.officeLocation,
        status: enterprise.status,
      })
      return
    }

    form.resetFields()
    form.setFieldValue('status', 'active')
    form.setFieldValue('companyType', '有限责任公司')
  }, [enterprise, form, open])

  return (
    <Modal
      className="enterprise-form-modal"
      open={open}
      title={enterprise ? '编辑企业' : '新增企业'}
      okText={enterprise ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      width={680}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => void form.validateFields().then(onSubmit)}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div className="enterprise-form-grid">
          <Form.Item
            name="name"
            label="企业名称"
            rules={[{ required: true, message: '请输入企业名称' }, { max: 60 }]}
          >
            <Input placeholder="请输入企业名称" />
          </Form.Item>
          <Form.Item
            name="creditCode"
            label="统一社会信用代码"
            rules={[
              { required: true, message: '请输入统一社会信用代码' },
              {
                pattern: /^[0-9A-Z]{18}$/,
                message: '请输入 18 位大写字母或数字',
              },
            ]}
          >
            <Input placeholder="请输入 18 位统一社会信用代码" maxLength={18} />
          </Form.Item>
          <Form.Item name="industry" label="所属行业" rules={[{ required: true }]}>
            <Select showSearch placeholder="请选择所属行业" options={industryOptions} />
          </Form.Item>
          <Form.Item name="companyType" label="企业类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '有限责任公司', value: '有限责任公司' },
                { label: '股份有限公司', value: '股份有限公司' },
                { label: '个人独资企业', value: '个人独资企业' },
              ]}
            />
          </Form.Item>
          <Form.Item name="contactName" label="联系人" rules={[{ required: true }]}>
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="officeLocation" label="办公位置" rules={[{ required: true }]}>
            <Input placeholder="例如 A区1号楼201" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '已入驻', value: 'active' },
                { label: '已停用', value: 'disabled' },
              ]}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default EnterpriseFormModal
