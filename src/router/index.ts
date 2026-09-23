import { createBrowserRouter, type RouteObject } from 'react-router'

import ForbiddenPage from '../pages/403'
import NotFoundPage from '../pages/404'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'

const routes = [
  {
    path: '/dashboard',
    Component: HomePage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/403',
    Component: ForbiddenPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes)

export default router
