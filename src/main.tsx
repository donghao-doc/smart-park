import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'antd/dist/reset.css'
import { enableMocking } from './mocks'
import './styles/index.scss'

// Ant Design 日期组件依赖 dayjs 的语言数据生成月份和星期文案
dayjs.locale('zh-cn')

await enableMocking()
// 路由初始化可能立即请求动态菜单，必须等 MSW 就绪后再加载应用模块
const { default: App } = await import('./App.tsx')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
