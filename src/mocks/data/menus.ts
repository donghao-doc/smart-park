import type { PermissionCode } from '../../types/auth'
import type { MenuItemDto } from '../../types/menu'

/**
 * 系统完整菜单树，由认证接口按当前角色权限动态裁剪
 */
export const mockMenus: MenuItemDto[] = [
  {
    id: 'menu_dashboard',
    type: 'menu',
    title: '运营总览',
    routeName: 'Dashboard',
    path: '/dashboard',
    componentKey: 'dashboard',
    icon: 'DashboardOutlined',
    sort: 10,
    visible: true,
    permission: 'dashboard:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_park',
    type: 'menu',
    title: '园区档案',
    routeName: 'ParkProfile',
    path: '/park/profile',
    componentKey: 'park-profile',
    icon: 'BankOutlined',
    sort: 20,
    visible: true,
    permission: 'park:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_enterprises',
    type: 'menu',
    title: '企业管理',
    routeName: 'EnterpriseList',
    path: '/enterprises',
    componentKey: 'enterprise-list',
    icon: 'ApartmentOutlined',
    sort: 30,
    visible: true,
    permission: 'enterprise:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_personnel',
    type: 'menu',
    title: '人员管理',
    routeName: 'PersonnelList',
    path: '/personnel',
    componentKey: 'personnel-list',
    icon: 'TeamOutlined',
    sort: 40,
    visible: true,
    permission: 'personnel:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_visitors',
    type: 'directory',
    title: '访客管理',
    routeName: 'VisitorManagement',
    path: '/visitors',
    componentKey: 'layout',
    icon: 'UserSwitchOutlined',
    sort: 50,
    visible: true,
    permission: null,
    redirect: '/visitors/appointments',
    children: [
      {
        id: 'menu_visitor_appointments',
        type: 'menu',
        title: '访客预约',
        routeName: 'VisitorAppointments',
        path: '/visitors/appointments',
        componentKey: 'visitor-appointments',
        icon: 'CalendarOutlined',
        sort: 10,
        visible: true,
        permission: 'visitor:view',
        redirect: null,
        children: [],
      },
      {
        id: 'menu_visitor_records',
        type: 'menu',
        title: '到访记录',
        routeName: 'VisitorRecords',
        path: '/visitors/records',
        componentKey: 'visitor-records',
        icon: 'HistoryOutlined',
        sort: 20,
        visible: true,
        permission: 'visitor:view',
        redirect: null,
        children: [],
      },
    ],
  },
  {
    id: 'menu_parking',
    type: 'directory',
    title: '车辆与停车',
    routeName: 'ParkingManagement',
    path: '/parking',
    componentKey: 'layout',
    icon: 'CarOutlined',
    sort: 60,
    visible: true,
    permission: null,
    redirect: '/parking/vehicles',
    children: [
      {
        id: 'menu_vehicles',
        type: 'menu',
        title: '车辆档案',
        routeName: 'VehicleList',
        path: '/parking/vehicles',
        componentKey: 'vehicle-list',
        icon: 'IdcardOutlined',
        sort: 10,
        visible: true,
        permission: 'vehicle:view',
        redirect: null,
        children: [],
      },
      {
        id: 'menu_parking_records',
        type: 'menu',
        title: '停车记录',
        routeName: 'ParkingRecords',
        path: '/parking/records',
        componentKey: 'parking-records',
        icon: 'FieldTimeOutlined',
        sort: 20,
        visible: true,
        permission: 'parking-record:view',
        redirect: null,
        children: [],
      },
    ],
  },
  {
    id: 'menu_work_orders',
    type: 'menu',
    title: '工单中心',
    routeName: 'WorkOrderList',
    path: '/work-orders',
    componentKey: 'work-order-list',
    icon: 'ToolOutlined',
    sort: 70,
    visible: true,
    permission: 'work-order:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_devices',
    type: 'menu',
    title: '设备管理',
    routeName: 'DeviceList',
    path: '/devices',
    componentKey: 'device-list',
    icon: 'HddOutlined',
    sort: 80,
    visible: true,
    permission: 'device:view',
    redirect: null,
    children: [],
  },
  {
    id: 'menu_system',
    type: 'directory',
    title: '系统管理',
    routeName: 'SystemManagement',
    path: '/system',
    componentKey: 'layout',
    icon: 'SettingOutlined',
    sort: 90,
    visible: true,
    permission: null,
    redirect: '/system/users',
    children: [
      {
        id: 'menu_system_users',
        type: 'menu',
        title: '用户管理',
        routeName: 'SystemUsers',
        path: '/system/users',
        componentKey: 'system-users',
        icon: 'UserOutlined',
        sort: 10,
        visible: true,
        permission: 'system-user:view',
        redirect: null,
        children: [],
      },
      {
        id: 'menu_operation_logs',
        type: 'menu',
        title: '操作日志',
        routeName: 'OperationLogs',
        path: '/system/logs',
        componentKey: 'operation-logs',
        icon: 'AuditOutlined',
        sort: 20,
        visible: true,
        permission: 'operation-log:view',
        redirect: null,
        children: [],
      },
      {
        id: 'menu_mock_data',
        type: 'menu',
        title: 'Mock 数据管理',
        routeName: 'MockDataManagement',
        path: '/system/mock-data',
        componentKey: 'mock-data-management',
        icon: 'DatabaseOutlined',
        sort: 30,
        visible: true,
        permission: 'mock-data:manage',
        redirect: null,
        children: [],
      },
    ],
  },
]

/**
 * 根据权限点裁剪菜单树，并移除没有可访问子菜单的空目录
 */
export function filterMenusByPermissions(permissions: PermissionCode[]): MenuItemDto[] {
  const permissionSet = new Set(permissions)

  return mockMenus
    .flatMap((menu) => {
      const children = filterMenuChildren(menu.children, permissionSet)
      const hasPermission = !menu.permission || permissionSet.has(menu.permission)
      const shouldKeep = menu.type === 'directory' ? children.length > 0 : hasPermission

      if (!shouldKeep) {
        return []
      }

      return [
        {
          ...menu,
          redirect: menu.type === 'directory' ? (children[0]?.path ?? null) : menu.redirect,
          children,
        },
      ]
    })
    .sort((a, b) => a.sort - b.sort)
}

/**
 * 递归过滤子菜单，并保持后端定义的排序
 */
function filterMenuChildren(
  menus: MenuItemDto[],
  permissionSet: ReadonlySet<PermissionCode>,
): MenuItemDto[] {
  return menus
    .flatMap((menu) => {
      const children = filterMenuChildren(menu.children, permissionSet)
      const hasPermission = !menu.permission || permissionSet.has(menu.permission)
      const shouldKeep = menu.type === 'directory' ? children.length > 0 : hasPermission

      return shouldKeep
        ? [
            {
              ...menu,
              redirect: menu.type === 'directory' ? (children[0]?.path ?? null) : menu.redirect,
              children,
            },
          ]
        : []
    })
    .sort((a, b) => a.sort - b.sort)
}
