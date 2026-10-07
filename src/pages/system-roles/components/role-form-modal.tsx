import { Col, Form, Input, Row } from 'antd'
import { useEffect } from 'react'

import ScrollableModal from '@/components/scrollable-modal'
import type { CreateRoleRequest, SystemRoleDto } from '@/types/system-role'
import './role-form-modal.scss'

/** 角色基本资料表单，权限由独立配置弹窗维护 */
export type RoleFormValues = Omit<CreateRoleRequest, 'permissions'>

interface RoleFormModalProps {
  /** 是否显示弹窗 */
  open: boolean
  /** 新建、编辑或复制角色的表单模式 */
  mode: 'create' | 'edit' | 'copy'
  /** 编辑或复制时使用的最新角色 */
  role?: SystemRoleDto
  /** 是否正在提交表单 */
  submitting: boolean
  /** 提交通过校验的基本资料 */
  onSubmit: (values: RoleFormValues) => void
  /** 关闭表单 */
  onCancel: () => void
}

/** 角色基本资料弹窗，复制时沿用说明和权限，要求重新填写唯一编码 */
export default function RoleFormModal({
  open,
  mode,
  role,
  submitting,
  onSubmit,
  onCancel,
}: RoleFormModalProps) {
  const [form] = Form.useForm<RoleFormValues>()

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue({
      code: mode === 'edit' ? role?.code : undefined,
      name: mode === 'copy' ? undefined : role?.name,
      description: role?.description ?? '',
    })
  }, [open, mode, role, form])

  return (
    <ScrollableModal
      className="role-form-modal"
      open={open}
      title={mode === 'edit' ? '编辑角色' : mode === 'copy' ? '复制角色' : '新增角色'}
      width={640}
      okText={mode === 'edit' ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      closable={!submitting}
      keyboard={!submitting}
      mask={{ closable: !submitting }}
      cancelButtonProps={{ disabled: submitting }}
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <Form
        name="system-role-form"
        form={form}
        layout="vertical"
        disabled={submitting}
        onFinish={onSubmit}
      >
        <Row gutter={20}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, whitespace: true, message: '请输入角色名称' }]}
            >
              <Input placeholder="例如：设备维护人员" maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="code"
              label="角色编码"
              extra={mode === 'edit' ? '角色编码创建后不可修改' : '4～32 位，以字母开头'}
              rules={[
                { required: true, message: '请输入角色编码' },
                {
                  pattern: /^[a-zA-Z][a-zA-Z0-9_-]{3,31}$/,
                  message: '仅支持字母、数字、下划线和连字符',
                },
              ]}
            >
              <Input
                placeholder="例如：device_maintainer"
                maxLength={32}
                disabled={submitting || mode === 'edit'}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="角色说明"
              extra={
                mode === 'copy'
                  ? `将复制「${role?.name}」的 ${role?.permissions.length ?? 0} 项权限，新角色数据范围为园区`
                  : mode === 'create'
                    ? '新角色数据范围为园区，创建后可配置菜单和操作权限'
                    : undefined
              }
            >
              <Input.TextArea
                placeholder="说明角色的职责或适用场景"
                maxLength={200}
                showCount
                rows={3}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </ScrollableModal>
  )
}
