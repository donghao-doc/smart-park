import dayjs from 'dayjs'

import type {
  WorkOrderDto,
  WorkOrderHistoryDto,
  WorkOrderImageDto,
  WorkOrderStatus,
  WorkOrderType,
} from '@/types/work-order'
import { seedEnterprises } from './enterprises'
import { seedUsers } from './users'

const initializedAt = dayjs()

/** 详情页使用的本地现场示例图片，不依赖外部图片服务 */
export const workOrderSampleImages: WorkOrderImageDto[] = [
  {
    id: 'sample-air-conditioner',
    name: '空调设备.svg',
    url: '/images/work-orders/air-conditioner.svg',
  },
  {
    id: 'sample-controller',
    name: '温控面板.svg',
    url: '/images/work-orders/controller.svg',
  },
  {
    id: 'sample-air-vent',
    name: '出风口.svg',
    url: '/images/work-orders/air-vent.svg',
  },
]
const titles = [
  'A栋3层空调不制冷',
  '办公区地毯清洁申请',
  'B区车位地锁异常',
  'C栋电梯定期保养',
  '企业入驻资料协助',
  '园区道路照明故障',
  '食堂服务问题反馈',
  '门禁设备无法识别',
  '公共区域绿化清理',
  '会议室设备调试',
]
const types: WorkOrderType[] = [
  'repair', 'cleaning', 'repair', 'repair', 'other',
  'repair', 'complaint', 'repair', 'cleaning', 'other',
]
const firstStatuses: WorkOrderStatus[] = [
  'pending_acceptance', 'pending_processing', 'processing', 'pending_confirmation',
  'pending_processing', 'processing', 'pending_acceptance', 'pending_processing',
  'completed', 'completed',
]

/** 根据完整生命周期生成可回溯的演示工单 */
function createWorkOrder(index: number, status: WorkOrderStatus): WorkOrderDto {
  const enterprise = seedEnterprises[index % 10]
  const assignee = seedUsers[index % 2]
  const createdAt = index < 10
    ? initializedAt.subtract(30 + index * 18, 'minute')
    : initializedAt.subtract(1 + index % 21, 'day').subtract(index % 12, 'hour')
  const history: WorkOrderHistoryDto[] = [{
    id: `woh_${index}_0`,
    action: 'create',
    operatorName: enterprise.contactName,
    occurredAt: createdAt.toISOString(),
    remark: '提交工单，请协助处理',
    status: 'pending_acceptance',
  }]
  const stages = [
    { action: 'accept', status: 'pending_processing', remark: `已受理，分派给${assignee.name}` },
    { action: 'start', status: 'processing', remark: '已到现场，开始处理问题' },
    { action: 'submit', status: 'pending_confirmation', remark: '问题已处理，现场检查正常，请企业确认' },
    { action: 'confirm', status: 'completed', remark: '企业已确认处理结果' },
  ] as const
  if (status === 'cancelled') {
    history.push({
      id: `woh_${index}_1`,
      action: 'cancel',
      operatorName: seedUsers[0].name,
      occurredAt: createdAt.add(5, 'minute').toISOString(),
      remark: '重复提交，取消本次工单',
      status: 'cancelled',
    })
  } else if (status !== 'pending_acceptance') {
    for (const [stageIndex, stage] of stages.entries()) {
      history.push({
        id: `woh_${index}_${stageIndex + 1}`,
        ...stage,
        operatorName: stage.action === 'confirm' ? enterprise.contactName : assignee.name,
        occurredAt: createdAt.add((stageIndex + 1) * 5, 'minute').toISOString(),
      })
      if (stage.status === status) break
    }
  }
  const assigned = status !== 'pending_acceptance' && status !== 'cancelled'
  return {
    id: `wo_${1001 + index}`,
    code: `GD${createdAt.format('YYYYMMDD')}${String(index + 1).padStart(4, '0')}`,
    title: index < 10 ? titles[index] : `${titles[index % 10]}（${Math.floor(index / 10) + 1}）`,
    type: types[index % 10],
    description: `${enterprise.name}提交${titles[index % 10]}，请安排工作人员检查并处理，完成后联系企业联系人确认结果。`,
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    contactName: enterprise.contactName,
    contactPhone: enterprise.contactPhone,
    location: enterprise.officeLocation,
    priority: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
    images: index < 4 ? structuredClone(workOrderSampleImages) : index % 4 === 0
      ? [structuredClone(workOrderSampleImages[0])]
      : [],
    status,
    assigneeId: assigned ? assignee.id : null,
    assigneeName: assigned ? assignee.name : null,
    creatorName: enterprise.contactName,
    createdAt: createdAt.toISOString(),
    updatedAt: history.at(-1)!.occurredAt,
    rating: status === 'completed' ? 4 + index % 2 : null,
    feedback: status === 'completed' ? '处理及时，问题已解决' : '',
    history,
  }
}

const statuses = [...firstStatuses]
const targetCounts: [WorkOrderStatus, number][] = [
  ['pending_acceptance', 18],
  ['pending_processing', 56],
  ['processing', 32],
  ['pending_confirmation', 24],
  ['completed', 320],
  ['cancelled', 8],
]
for (const [status, count] of targetCounts) {
  const initialCount = firstStatuses.filter((item) => item === status).length
  statuses.push(...Array<WorkOrderStatus>(count - initialCount).fill(status))
}

/** 458 条工单，覆盖全部状态、四种类型、处理历史和企业范围 */
export const seedWorkOrders: WorkOrderDto[] = statuses.map((status, index) => createWorkOrder(index, status))
