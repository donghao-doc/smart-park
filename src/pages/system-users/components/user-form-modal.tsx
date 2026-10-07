import { Alert, Button, Col, Form, Input, Row, Select, type SelectProps } from 'antd'
import { useEffect } from 'react'

import ScrollableModal from '@/components/scrollable-modal'
import type { UserDto } from '@/types/auth'
import type { UpdateUserRequest } from '@/types/system-user'
import './user-form-modal.scss'

/** 新增或编辑用户的表单数据，初始密码仅在新增时必填 */
export interface UserFormValues extends UpdateUserRequest {
  /** 新账号首次登录密码，至少 8 位；编辑资料时不修改密码 */
  password?: string
}

interface UserFormModalProps {
  /** 是否展示表单 */
  open: boolean
  /** 编辑时使用的最新用户详情，新增时为空 */
  user?: UserDto
  /** 接口返回的可分配角色选项 */
  roleOptions: SelectProps['options']
  /** 可分配的企业选项，已停用企业不可选择 */
  enterpriseOptions: SelectProps['options']
  /** 角色和企业选项是否正在加载 */
  optionsLoading: boolean
  /** 角色或企业选项是否加载失败 */
  optionsError: boolean
  /** 是否仅分配角色，保留隐藏的账号字段而不修改它们 */
  roleOnly?: boolean
  /** 是否允许修改用户角色，普通资料编辑不包含授权能力 */
  canAssignRole: boolean
  /** 是否正在保存资料 */
  submitting: boolean
  /** 提交通过校验的表单资料 */
  onSubmit: (values: UserFormValues) => void
  /** 重试加载角色和企业选项 */
  onRetryOptions: () => void
  /** 关闭弹窗 */
  onCancel: () => void
}

/** 用户新增和编辑表单，按角色约束企业归属并保护管理员角色 */
function UserFormModal({
  open,
  user,
  roleOptions,
  enterpriseOptions,
  optionsLoading,
  optionsError,
  submitting,
  canAssignRole,
  roleOnly = false,
  onSubmit,
  onRetryOptions,
  onCancel,
}: UserFormModalProps) {
  const [form] = Form.useForm<UserFormValues>()
  const roleCode = Form.useWatch('roleCode', form)

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue(
      user
        ? {
            username: user.username,
            name: user.name,
            roleCode: user.role.code,
            enterpriseId: user.enterprise?.id,
          }
        : {},
    )
  }, [form, open, user])

  return (
    <ScrollableModal
      className="user-form-modal"
      open={open}
      title={roleOnly ? '分配角色' : user ? '编辑用户' : '新增用户'}
      width={640}
      okText={user ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      okButtonProps={{ disabled: optionsLoading || optionsError }}
      cancelButtonProps={{ disabled: submitting }}
      closable={!submitting}
      keyboard={!submitting}
      mask={{ closable: !submitting }}
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      {optionsError ? (
        <Alert
          className="user-form-feedback"
          type="error"
          showIcon
          title="角色或企业选项加载失败，请重试后保存"
          action={
            <Button size="small" onClick={onRetryOptions}>
              重试
            </Button>
          }
        />
      ) : null}
      <Form
        name="user-form"
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        disabled={submitting}
      >
        <Row gutter={20}>
          <Col xs={roleOnly ? 0 : 24} md={roleOnly ? 0 : 12}>
            <Form.Item
              hidden={roleOnly}
              name="username"
              label="用户名"
              rules={[
                { required: true, whitespace: true, message: '请输入用户名' },
                {
                  pattern: /^[a-zA-Z][a-zA-Z0-9._-]{3,31}$/,
                  message: '以字母开头，4～32 位，可含数字、点、下划线和连字符',
                },
              ]}
            >
              <Input placeholder="请输入用户名" maxLength={32} autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={roleOnly ? 0 : 24} md={roleOnly ? 0 : 12}>
            <Form.Item
              hidden={roleOnly}
              name="name"
              label="姓名"
              rules={[
                { required: true, whitespace: true, message: '请输入姓名' },
                { max: 30, message: '姓名最多 30 个字符' },
              ]}
            >
              <Input placeholder="请输入姓名" maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="roleCode"
              label="角色"
              extra={
                user?.role.code === 'super_admin'
                  ? '超级管理员账号不能变更为其他角色'
                  : user && !roleOnly
                    ? '调整角色请使用用户列表中的“分配角色”操作'
                    : undefined
              }
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select
                placeholder="请选择角色"
                options={roleOptions}
                loading={optionsLoading}
                disabled={
                  submitting ||
                  optionsLoading ||
                  optionsError ||
                  !canAssignRole ||
                  (Boolean(user) && !roleOnly) ||
                  user?.role.code === 'super_admin'
                }
                onChange={() => form.setFieldValue('enterpriseId', undefined)}
              />
            </Form.Item>
          </Col>
          {roleCode === 'enterprise_user' ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="enterpriseId"
                label="所属企业"
                rules={[{ required: true, message: '请选择所属企业' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择所属企业"
                  options={enterpriseOptions}
                  loading={optionsLoading}
                  disabled={submitting || optionsLoading || optionsError}
                />
              </Form.Item>
            </Col>
          ) : null}
          {!user ? (
            <Col span={24}>
              <Form.Item
                name="password"
                label="初始密码"
                extra="新用户默认启用，请妥善保管并告知用户登录密码"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入初始密码',
                  },
                  { min: 8, message: '初始密码至少需要 8 位' },
                ]}
              >
                <Input.Password placeholder="请输入至少 8 位的密码" autoComplete="new-password" />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </ScrollableModal>
  )
}

export default UserFormModal
