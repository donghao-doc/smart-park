import { App as AntdApp } from 'antd'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router/dom'
import { setErrorMessageHandler, setHttpNavigator } from './http/runtime'
import router from './router'

/**
 * 将依赖 React 上下文的 antd 消息和路由能力注入 HTTP 运行时
 */
function HttpRuntimeBridge() {
  const { message } = AntdApp.useApp()

  useEffect(() => {
    setErrorMessageHandler((content) => {
      void message.error(content)
    })
    setHttpNavigator((target) => {
      void router.navigate(target)
    })

    return () => {
      setErrorMessageHandler(undefined)
      setHttpNavigator(undefined)
    }
  }, [message])

  return null
}

/**
 * 应用根组件
 */
function App() {
  return (
    <AntdApp>
      <HttpRuntimeBridge />
      <RouterProvider router={router} />
    </AntdApp>
  )
}

export default App
