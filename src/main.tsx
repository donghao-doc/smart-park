import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import { enableMocking } from './mocks'
import './styles/index.scss'

await enableMocking()
// 路由初始化可能立即请求动态菜单，必须等 MSW 就绪后再加载应用模块
const { default: App } = await import('./App.tsx')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
