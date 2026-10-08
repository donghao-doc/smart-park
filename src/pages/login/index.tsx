import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Checkbox, Divider, Form, Input, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { reqGetDemoAccounts, reqLogin } from '@/api'
import { initializeDynamicRoutes } from '@/router'
import { getPostLoginPath } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import type { DemoAccountDto, LoginRequest } from '@/types/auth'
import './login.scss'

const REMEMBERED_ACCOUNT_KEY = 'smart-park.remembered-account'

/**
 * 登录页：展示演示账号并通过认证接口建立会话
 */
function LoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { search } = useLocation()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const resetMenus = useMenuStore((state) => state.resetMenus)
  const resetUser = useUserStore((state) => state.resetUser)
  const [form] = Form.useForm<LoginRequest>()
  const [rememberAccount, setRememberAccount] = useState(() =>
    Boolean(localStorage.getItem(REMEMBERED_ACCOUNT_KEY)),
  )
  const [submitting, setSubmitting] = useState(false)
  const [demoAccounts, setDemoAccounts] = useState<DemoAccountDto[]>([])
  const [demoLoading, setDemoLoading] = useState(true)
  const [demoLoadFailed, setDemoLoadFailed] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const accounts = await reqGetDemoAccounts()
        if (active) {
          setDemoAccounts(accounts)
        }
      } catch {
        if (active) {
          setDemoLoadFailed(true)
        }
      } finally {
        if (active) {
          setDemoLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  /**
   * 登录成功后建立会话并提示用户，仅在勾选时记住账号名称
   */
  async function handleSubmit(values: LoginRequest) {
    setSubmitting(true)

    try {
      const username = values.username.trim()
      const session = await reqLogin({ username, password: values.password })
      resetMenus()
      resetUser()
      setAccessToken(session.accessToken)
      await initializeDynamicRoutes()

      if (rememberAccount) {
        localStorage.setItem(REMEMBERED_ACCOUNT_KEY, username)
      } else {
        localStorage.removeItem(REMEMBERED_ACCOUNT_KEY)
      }

      void message.success('登录成功')
      void navigate(getPostLoginPath(search), { replace: true })
    } catch {
      // 登录错误由统一 HTTP 层展示，保留表单内容便于重试
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 将所选演示账号填入表单，用户仍需主动点击登录
   */
  function handleSelectDemoAccount(account: DemoAccountDto) {
    form.setFieldsValue({
      username: account.username,
      password: account.password,
    })
    form.setFields([
      { name: 'username', errors: [] },
      { name: 'password', errors: [] },
    ])
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand">智慧园区</div>
        <div className="login-tagline">数字园区 · 智慧运营 · 共建美好未来</div>
      </header>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-heading">
          <h1 id="login-title">欢迎登录</h1>
          <p>智慧园区管理平台</p>
        </div>

        <Form<LoginRequest>
          form={form}
          layout="vertical"
          initialValues={{
            username: localStorage.getItem(REMEMBERED_ACCOUNT_KEY) ?? '',
          }}
          onFinish={handleSubmit}
          requiredMark={false}
          className="login-form"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          <Checkbox
            checked={rememberAccount}
            onChange={(event) => setRememberAccount(event.target.checked)}
          >
            记住账号
          </Checkbox>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            className="login-submit"
          >
            登录
          </Button>
        </Form>

        <Divider className="login-demo-divider">演示账号</Divider>

        <div className="login-demo-accounts" aria-label="演示账号">
          {demoLoading ? (
            <Spin size="small" />
          ) : demoLoadFailed ? (
            <span className="login-demo-error">演示账号暂时无法加载</span>
          ) : (
            demoAccounts.map((account) => (
              <Button
                key={account.roleCode}
                icon={<UserOutlined />}
                onClick={() => handleSelectDemoAccount(account)}
                className="login-demo-button"
              >
                {account.roleName}
              </Button>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default LoginPage
