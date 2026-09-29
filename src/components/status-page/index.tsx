import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

import './status-page.scss'

interface StatusPageProps {
  /** Ant Design Result 支持的异常状态码 */
  status: '403' | '404'
  /** 面向用户展示的中文提示 */
  subTitle: string
}

/**
 * 展示全屏异常结果，并提供返回首页和上一页操作
 * @param props 异常状态和提示文案
 */
function StatusPage({ status, subTitle }: StatusPageProps) {
  const navigate = useNavigate()

  return (
    <main className="status-page">
      <Result
        status={status}
        title={status}
        subTitle={subTitle}
        extra={[
          <Button key="home" type="primary" onClick={() => void navigate('/dashboard')}>
            返回首页
          </Button>,
          <Button key="back" onClick={() => void navigate(-1)}>
            返回上一页
          </Button>,
        ]}
      />
    </main>
  )
}

export default StatusPage
