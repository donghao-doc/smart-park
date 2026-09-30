import { createBrowserRouter, type RouteObject } from 'react-router'

import AdminLayout from '../layout'
import ForbiddenPage from '../pages/403'
import NotFoundPage from '../pages/404'
import DashboardPage from '../pages/dashboard'
import DeviceListPage from '../pages/device-list'
import EnterpriseListPage from '../pages/enterprise-list'
import LoginPage from '../pages/login'
import MockDataManagementPage from '../pages/mock-data-management'
import OperationLogsPage from '../pages/operation-logs'
import ParkProfilePage from '../pages/park-profile'
import ParkingRecordsPage from '../pages/parking-records'
import PersonnelListPage from '../pages/personnel-list'
import SystemUsersPage from '../pages/system-users'
import VehicleListPage from '../pages/vehicle-list'
import VisitorAppointmentsPage from '../pages/visitor-appointments'
import VisitorRecordsPage from '../pages/visitor-records'
import WorkOrderListPage from '../pages/work-order-list'
import { preventRepeatedLogin, requireAuthentication } from './utils'

const routes = [
  {
    path: '/login',
    loader: preventRepeatedLogin,
    Component: LoginPage,
  },
  {
    loader: requireAuthentication,
    // 共同父级路由保持不变时也重新校验，以同步最后访问的已登录页面
    shouldRevalidate: () => true,
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            path: '/dashboard',
            Component: DashboardPage,
          },
          { path: '/park/profile', Component: ParkProfilePage },
          { path: '/enterprises', Component: EnterpriseListPage },
          { path: '/personnel', Component: PersonnelListPage },
          { path: '/visitors/appointments', Component: VisitorAppointmentsPage },
          { path: '/visitors/records', Component: VisitorRecordsPage },
          { path: '/parking/vehicles', Component: VehicleListPage },
          { path: '/parking/records', Component: ParkingRecordsPage },
          { path: '/work-orders', Component: WorkOrderListPage },
          { path: '/devices', Component: DeviceListPage },
          { path: '/system/users', Component: SystemUsersPage },
          { path: '/system/logs', Component: OperationLogsPage },
          { path: '/system/mock-data', Component: MockDataManagementPage },
        ],
      },
      {
        path: '/403',
        Component: ForbiddenPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
] satisfies RouteObject[]

/**
 * 应用浏览器路由实例
 */
const router = createBrowserRouter(routes)

export default router
