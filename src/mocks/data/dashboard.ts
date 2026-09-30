import type {
  DashboardMetricDto,
  DashboardTaskDto,
  DeviceStatusDto,
  VisitorTrendPointDto,
  WorkOrderTrendPointDto,
} from '../../types/dashboard'

/**
 * Dashboard 顶部指标种子数据
 */
export const dashboardMetrics: DashboardMetricDto[] = [
  {
    key: 'enterprise',
    title: '入驻企业',
    value: 328,
    unit: '家',
    change: '+12',
    direction: 'up',
    comparison: '较上周',
  },
  {
    key: 'personnel',
    title: '园区人员',
    value: 5320,
    unit: '人',
    change: '+3%',
    direction: 'up',
    comparison: '较上周',
  },
  {
    key: 'visitor',
    title: '今日访客',
    value: 268,
    unit: '人',
    change: '+18%',
    direction: 'up',
    comparison: '较昨日',
  },
  {
    key: 'vehicle',
    title: '在场车辆',
    value: 1024,
    unit: '辆',
    change: '-6%',
    direction: 'down',
    comparison: '较昨日',
  },
  {
    key: 'workOrder',
    title: '待处理工单',
    value: 18,
    unit: '件',
    change: '-25%',
    direction: 'down',
    comparison: '较昨日',
  },
  {
    key: 'device',
    title: '在线设备',
    value: 892,
    unit: '台',
    change: '+2%',
    direction: 'up',
    comparison: '较上周',
  },
]

/**
 * 最近 30 日访客趋势种子数据
 */
export const visitorTrendData: VisitorTrendPointDto[] = [
  172, 196, 208, 185, 221, 238, 214, 246, 232, 268, 251, 276, 289, 264, 302, 286, 315, 298, 326,
  304, 292, 275, 250, 180, 260, 320, 298, 310, 240, 268,
].map((value, index) => ({
  date: new Date(Date.UTC(2024, 2, 24 + index)).toISOString().slice(0, 10),
  value,
}))

/**
 * 最近 30 日工单趋势种子数据
 */
export const workOrderTrendData: WorkOrderTrendPointDto[] = [
  [42, 35], [46, 38], [41, 36], [53, 44], [57, 48], [49, 43], [55, 47], [61, 50], [58, 52],
  [63, 54], [66, 57], [59, 51], [72, 61], [68, 58], [64, 55], [71, 60], [75, 63], [69, 59],
  [73, 62], [65, 56], [60, 51], [58, 49], [64, 53], [48, 38], [62, 50], [56, 45], [70, 60],
  [68, 55],
  [52, 48], [46, 40],
].map(([created, completed], index) => ({
  date: new Date(Date.UTC(2024, 2, 24 + index)).toISOString().slice(0, 10),
  created,
  completed,
}))

/**
 * Dashboard 今日待办种子数据
 */
export const dashboardTasks: DashboardTaskDto[] = [
  {
    id: 'task_1001',
    title: 'A栋3层空调故障处理',
    category: '设备维修',
    priority: 'high',
    createdAt: '2024-04-22T09:12:00+08:00',
    actionPath: '/work-orders?task=task_1001',
  },
  {
    id: 'task_1002',
    title: '访客预约审核（李四）',
    category: '访客管理',
    priority: 'medium',
    createdAt: '2024-04-22T09:40:00+08:00',
    actionPath: '/visitors/appointments?task=task_1002',
  },
  {
    id: 'task_1003',
    title: 'B区车位地锁异常',
    category: '停车管理',
    priority: 'high',
    createdAt: '2024-04-22T10:03:00+08:00',
    actionPath: '/devices?task=task_1003',
  },
  {
    id: 'task_1004',
    title: 'C栋电梯定期保养',
    category: '设备维护',
    priority: 'medium',
    createdAt: '2024-04-22T10:08:00+08:00',
    actionPath: '/devices?task=task_1004',
  },
  {
    id: 'task_1005',
    title: '企业入驻资料审核',
    category: '企业管理',
    priority: 'low',
    createdAt: '2024-04-22T10:20:00+08:00',
    actionPath: '/enterprises?task=task_1005',
  },
]

/**
 * Dashboard 设备状态种子数据
 */
export const deviceStatuses: DeviceStatusDto[] = [
  { key: 'online', label: '在线', value: 892, percentage: 78 },
  { key: 'offline', label: '离线', value: 156, percentage: 14 },
  { key: 'warning', label: '告警', value: 64, percentage: 6 },
  { key: 'maintenance', label: '维护中', value: 24, percentage: 2 },
]
