import { RouterProvider } from 'react-router/dom'
import router from './router'

/**
 * 应用根组件
 */
function App() {
  return <RouterProvider router={router} />
}

export default App
