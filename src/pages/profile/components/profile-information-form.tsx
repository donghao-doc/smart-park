import { SaveOutlined } from '@ant-design/icons'
import { App, Button, Col, Flex, Form, Input, Row } from 'antd'
import { useEffect, useState } from 'react'

import { useUserStore } from '@/stores/user'
import type { UpdateCurrentUserRequest, UserDto } from '@/types/auth'
import './profile-information-form.scss'

/** 个人资料表单所需的当前账号信息 */
interface ProfileInformationFormProps {
  /** 登录用户资料，账号、角色与企业归属仅用于展示 */
  user: UserDto
}

/** 编辑显示姓名，保存后同步页面与顶部账号菜单 */
function ProfileInformationForm({ user }: ProfileInformationFormProps) {
  const [form] = Form.useForm<UpdateCurrentUserRequest>()
  const { message } = App.useApp()
  const [submitting, setSubmitting] = useState(false)
  const reqUpdateProfile = useUserStore((state) => state.reqUpdateProfile)

  useEffect(() => {
    form.setFieldsValue({ name: user.name })
  }, [form, user.name])

  /** 仅提交允许自行修改的姓名，并保留接口失败时的表单输入 */
  async function handleSubmit(values: UpdateCurrentUserRequest) {
    setSubmitting(true)
    try {
      const updatedUser = await reqUpdateProfile({ name: values.name.trim() })
      if (updatedUser) {
        form.setFieldsValue({ name: updatedUser.name })
        void message.success('个人资料已保存')
      }
    } catch {
      // 接口异常已由统一 HTTP 层展示，保留输入以便重试
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form<UpdateCurrentUserRequest>
      form={form}
      layout="vertical"
      className="profile-information-form"
      initialValues={{ name: user.name }}
      disabled={submitting}
      onFinish={handleSubmit}
    >
      <h2 className="profile-section-title">个人资料</h2>
      <p className="profile-section-description">姓名用于系统内的身份展示，可按需修改</p>

      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="登录账号" extra="登录账号由管理员统一维护">
            <Input value={user.username} disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请输入姓名' },
              { max: 30, message: '姓名不能超过 30 个字符' },
            ]}
          >
            <Input placeholder="请输入姓名" maxLength={30} autoComplete="name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="当前角色" extra="角色与访问权限由管理员分配">
            <Input value={user.role.name} disabled />
          </Form.Item>
        </Col>
        {user.role.code === 'enterprise_user' ? (
          <Col xs={24} md={12}>
            <Form.Item label="所属企业" extra="企业归属由管理员统一维护">
              <Input value={user.enterprise?.name ?? '未关联企业'} disabled />
            </Form.Item>
          </Col>
        ) : null}
      </Row>

      <Flex gap={12} className="profile-form-actions">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
          保存资料
        </Button>
        <Button onClick={() => form.setFieldsValue({ name: user.name })}>重置</Button>
      </Flex>
    </Form>
  )
}

export default ProfileInformationForm
