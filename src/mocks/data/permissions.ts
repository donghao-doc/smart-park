import type { PermissionCode } from '@/types/auth'
import type { MenuItemDto } from '@/types/menu'
import type { PermissionNodeDto } from '@/types/system-role'
import { mockMenus } from './menus'

/** 系统可授权权限点的中文业务名称 */
const permissionLabels: Record<PermissionCode, string> = {
  'dashboard:view': '访问运营总览',
  'park:view': '访问园区档案',
  'park:update': '编辑园区档案',
  'enterprise:view': '访问企业管理',
  'enterprise:create': '新增企业',
  'enterprise:update': '编辑企业',
  'enterprise:status': '启用 / 停用企业',
  'personnel:view': '访问人员管理',
  'personnel:create': '新增人员',
  'personnel:update': '编辑人员',
  'personnel:status': '启用 / 停用人员',
  'visitor:view': '访问访客预约',
  'visitor-record:view': '访问到访记录',
  'visitor:create': '新增访客预约',
  'visitor:approve': '审核预约',
  'visitor:check-in': '到访登记',
  'visitor:check-out': '离园登记',
  'visitor:cancel': '取消预约',
  'vehicle:view': '访问车辆档案',
  'vehicle:create': '新增车辆',
  'vehicle:update': '编辑车辆',
  'vehicle:status': '启用 / 停用车辆',
  'parking-record:view': '访问停车记录',
  'work-order:view': '访问工单中心',
  'work-order:create': '新增工单',
  'work-order:process': '处理工单',
  'work-order:confirm': '确认工单',
  'work-order:cancel': '取消工单',
  'work-order:reopen': '重新打开工单',
  'device:view': '访问设备管理',
  'device:create': '新增设备',
  'device:update': '编辑设备',
  'device:status': '启用 / 停用设备',
  'system-user:view': '访问用户管理',
  'system-user:create': '新增用户',
  'system-user:update': '编辑用户',
  'system-user:status': '启用 / 停用用户',
  'system-user:reset-password': '重置密码',
  'system-user:assign-role': '分配角色',
  'system-role:view': '访问角色管理',
  'system-role:create': '新增 / 复制角色',
  'system-role:update': '编辑角色',
  'system-role:grant': '配置角色权限',
  'system-role:delete': '删除角色',
  'operation-log:view': '访问操作日志',
  'mock-data:manage': '访问并管理 Mock 数据',
}

/** 完整权限白名单，用于校验授权请求 */
export const permissionCodes = Object.keys(permissionLabels) as PermissionCode[]

/** 从完整菜单生成权限目录，共用权限的页面保持联动 */
function createPermissionNodes(menus: MenuItemDto[]): PermissionNodeDto[] {
  return menus.map((menu) => {
    const prefix =
      menu.componentKey === 'visitor-records' ? 'visitor' : menu.permission?.split(':')[0]
    // 到访操作属于到访记录，预约操作属于访客预约，两个页面的访问权限独立配置
    const actions = permissionCodes.filter((permission) => {
      if (!prefix || permission === menu.permission || !permission.startsWith(`${prefix}:`)) {
        return false
      }
      if (prefix !== 'visitor') return true
      const isRecordAction = permission === 'visitor:check-in' || permission === 'visitor:check-out'
      return menu.componentKey === 'visitor-records' ? isRecordAction : !isRecordAction
    })
    return {
      key: menu.id,
      title: menu.title,
      permission: menu.permission,
      children:
        menu.type === 'directory'
          ? createPermissionNodes(menu.children)
          : actions.map((permission) => ({
              key: `${menu.id}:${permission}`,
              title: permissionLabels[permission],
              permission,
              children: [],
            })),
    }
  })
}

/** 角色配置和用户权限查看共用的完整菜单及操作目录 */
export const permissionCatalog = createPermissionNodes(mockMenus)
