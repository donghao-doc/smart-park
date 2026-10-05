import { LockOutlined } from '@ant-design/icons'
import { Alert, App, Button, Flex, Form, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { reqChangePassword } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import type { ChangePasswordRequest } from '@/types/auth'
import './profile-password-form.scss'

/** 密码修改表单，确认密码仅用于前端校验 */
interface PasswordFormValues extends ChangePasswordRequest {
  /** 再次输入的新密码，必须与新密码一致 */
  confirmPassword: string
}

/** 校验并提交密码修改，成功后清理当前会话并返回登录页 */
function ProfilePasswordForm() {
  const [form] = Form.useForm<PasswordFormValues>()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  /** 只发送原密码和新密码，会话发生切换时避免清除新账号的状态 */
  async function handleSubmit(values: PasswordFormValues) {
    const accessToken = useAuthStore.getState().accessToken
    setSubmitting(true)
    try {
      await reqChangePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      if (accessToken !== useAuthStore.getState().accessToken) return

      form.resetFields()
      useMenuStore.getState().resetMenus()
      useAuthStore.getState().clearSession()
      void message.success('密码修改成功，请使用新密码重新登录')
      await navigate('/login?redirect=%2Fprofile', { replace: true })
    } catch {
      // 统一 HTTP 层展示异常，修改失败时不清除会话和表单
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form<PasswordFormValues>
      form={form}
      layout="vertical"
      className="profile-password-form"
      disabled={submitting}
      onFinish={handleSubmit}
    >
      <h2 className="profile-section-title">修改登录密码</h2>
      <p className="profile-section-description">验证当前密码后，为账号设置新的登录密码</p>
      <Alert
        type="info"
        showIcon
        className="profile-password-notice"
        title="修改成功后，账号的所有登录会话将失效，需要使用新密码重新登录"
      />

      <Form.Item
        label="当前密码"
        name="currentPassword"
        rules={[{ required: true, message: '请输入当前密码' }]}
      >
        <Input.Password placeholder="请输入当前密码" autoComplete="current-password" />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="newPassword"
        dependencies={['currentPassword']}
        extra="密码长度为 8～64 位，建议组合使用字母、数字和符号"
        rules={[
          { required: true, whitespace: true, message: '请输入新密码' },
          { min: 8, max: 64, message: '新密码长度需为 8～64 位' },
          ({ getFieldValue }) => ({
            validator: async (_, value: string | undefined) => {
              if (value && value === getFieldValue('currentPassword')) {
                throw new Error('新密码不能与当前密码相同')
              }
            },
          }),
        ]}
      >
        <Input.Password placeholder="请输入新密码" autoComplete="new-password" maxLength={64} />
      </Form.Item>
      <Form.Item
        label="确认新密码"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请再次输入新密码' },
          ({ getFieldValue }) => ({
            validator: async (_, value: string | undefined) => {
              if (value && value !== getFieldValue('newPassword')) {
                throw new Error('两次输入的新密码不一致')
              }
            },
          }),
        ]}
      >
        <Input.Password placeholder="请再次输入新密码" autoComplete="new-password" maxLength={64} />
      </Form.Item>

      <Flex gap={12} className="profile-form-actions">
        <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={submitting}>
          修改密码
        </Button>
        <Button onClick={() => form.resetFields()}>重置</Button>
      </Flex>
    </Form>
  )
}

export default ProfilePasswordForm
