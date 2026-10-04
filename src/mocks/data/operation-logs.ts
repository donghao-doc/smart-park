import dayjs from 'dayjs'

import type { OperationLogDetailDto } from '@/types/operation-log'

/** 日志样本的业务信息，时间和日志标识在生成时分配 */
type LogScenario = Omit<OperationLogDetailDto, 'id' | 'operatedAt'>

const scenarios: LogScenario[] = [
  {
    operatorName: '张三',
    roleName: '超级管理员',
    module: 'personnel',
    action: '新增',
    objectName: '员工：李四',
    objectId: 'per_1004',
    ipAddress: '192.168.1.100',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/personnel',
    description: '新增员工档案',
    requestParams: { name: '李四', enterpriseId: 'ent_1001' },
    failureReason: null,
  },
  {
    operatorName: '王五',
    roleName: '企业用户',
    module: 'enterprise',
    action: '修改',
    objectName: '企业：腾讯科技',
    objectId: 'ent_1002',
    ipAddress: '192.168.1.101',
    result: 'success',
    requestMethod: 'PUT',
    requestUrl: '/api/enterprises/ent_1002',
    description: '修改企业联系人信息',
    requestParams: { contactName: '王五', contactPhone: '138****1234' },
    failureReason: null,
  },
  {
    operatorName: '李四',
    roleName: '超级管理员',
    module: 'device',
    action: '删除',
    objectName: '设备：A栋3层摄像头',
    objectId: 'DEV-20240422-003',
    ipAddress: '192.168.1.102',
    result: 'failure',
    requestMethod: 'DELETE',
    requestUrl: '/api/device/DEV-20240422-003',
    description: '删除设备',
    requestParams: { deviceId: 'DEV-20240422-003', force: false },
    failureReason: '该设备已被引用，无法删除。请先解除相关绑定关系后重试。',
  },
  {
    operatorName: '赵六',
    roleName: '园区运营人员',
    module: 'parking',
    action: '修改',
    objectName: '车位：B区-001',
    objectId: 'space_b001',
    ipAddress: '192.168.1.103',
    result: 'success',
    requestMethod: 'PATCH',
    requestUrl: '/api/parking/spaces/space_b001',
    description: '调整车位使用状态',
    requestParams: { status: 'available' },
    failureReason: null,
  },
  {
    operatorName: '张三',
    roleName: '超级管理员',
    module: 'system',
    action: '登录',
    objectName: null,
    objectId: null,
    ipAddress: '192.168.1.100',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/auth/login',
    description: '登录智慧园区管理系统',
    requestParams: { username: 'admin', password: '******' },
    failureReason: null,
  },
  {
    operatorName: '王五',
    roleName: '企业用户',
    module: 'visitor',
    action: '审核',
    objectName: '访客：陈明',
    objectId: 'appointment_1001',
    ipAddress: '192.168.1.104',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/visitor-appointments/appointment_1001/approve',
    description: '审核通过访客预约',
    requestParams: { approved: true },
    failureReason: null,
  },
  {
    operatorName: '李四',
    roleName: '超级管理员',
    module: 'device',
    action: '重启',
    objectName: '设备：C栋电梯',
    objectId: 'device_1008',
    ipAddress: '192.168.1.102',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/devices/device_1008/restart',
    description: '远程重启设备',
    requestParams: { deviceId: 'device_1008' },
    failureReason: null,
  },
  {
    operatorName: '赵六',
    roleName: '园区运营人员',
    module: 'work_order',
    action: '处理',
    objectName: '工单：WX2024042201',
    objectId: 'work_order_1001',
    ipAddress: '192.168.1.103',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/work-orders/work_order_1001/process',
    description: '提交工单处理结果',
    requestParams: { result: '已完成设备检修，恢复正常运行' },
    failureReason: null,
  },
  {
    operatorName: '张三',
    roleName: '超级管理员',
    module: 'personnel',
    action: '导出',
    objectName: '人员列表',
    objectId: null,
    ipAddress: '192.168.1.100',
    result: 'success',
    requestMethod: 'GET',
    requestUrl: '/api/personnel/export',
    description: '导出人员列表',
    requestParams: null,
    failureReason: null,
  },
  {
    operatorName: '王五',
    roleName: '企业用户',
    module: 'enterprise',
    action: '新增',
    objectName: '企业：阿里巴巴',
    objectId: 'ent_1001',
    ipAddress: '192.168.1.101',
    result: 'success',
    requestMethod: 'POST',
    requestUrl: '/api/enterprises',
    description: '登记企业入驻资料',
    requestParams: { name: '阿里巴巴', industry: '互联网' },
    failureReason: null,
  },
  {
    operatorName: '赵六',
    roleName: '园区运营人员',
    module: 'park',
    action: '修改',
    objectName: '园区：智慧科技园',
    objectId: 'park_1001',
    ipAddress: '192.168.1.103',
    result: 'success',
    requestMethod: 'PUT',
    requestUrl: '/api/park/profile',
    description: '更新园区服务电话',
    requestParams: { servicePhone: '010-88886666' },
    failureReason: null,
  },
  {
    operatorName: '李四',
    roleName: '超级管理员',
    module: 'system',
    action: '修改',
    objectName: '用户：王五',
    objectId: 'usr_1005',
    ipAddress: '192.168.1.102',
    result: 'failure',
    requestMethod: 'PUT',
    requestUrl: '/api/system/users/usr_1005',
    description: '修改用户登录账号',
    requestParams: {
      username: 'admin',
      name: '王五',
      roleCode: 'enterprise_user',
    },
    failureReason: '登录账号已被使用，请更换账号后重试。',
  },
]

// 从昨日开始生成历史快照，避免凌晨访问时出现未来时间
const latestTime = dayjs()
  .subtract(1, 'day')
  .startOf('day')
  .add(10, 'hour')
  .add(20, 'minute')
  .add(15, 'second')
const timeOffsets = [0, 283, 1014, 1288, 2403, 3477, 4090, 5022, 6416, 7204, 8420, 9120]

/** 生成覆盖最近 13 天的只读日志，首组场景对应设计图 */
function createOperationLog(index: number): OperationLogDetailDto {
  const scenarioIndex = index % scenarios.length
  const operatedAt = latestTime
    .subtract(Math.floor(index / scenarios.length), 'day')
    .subtract(timeOffsets[scenarioIndex], 'second')
    .toISOString()

  return {
    ...scenarios[scenarioIndex],
    id: `log_${1001 + index}`,
    operatedAt,
  }
}

/** 操作日志种子数据，独立于可编辑业务数据，保留历史操作快照 */
export const seedOperationLogs: OperationLogDetailDto[] = Array.from({ length: 156 }, (_, index) =>
  createOperationLog(index),
)
