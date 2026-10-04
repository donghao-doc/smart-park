import type { VisitorAppointmentDto, VisitorAppointmentStatus } from '@/types/visitor-appointment'
import { seedEnterprises } from './enterprises'
import { seedPersonnel } from './personnel'

const visitorNames = [
  '李明',
  '张华',
  '王强',
  '刘敏',
  '陈磊',
  '赵丽',
  '周伟',
  '杨洋',
  '何雪',
  '高飞',
  '林晓',
  '孙宁',
]
const plateNumbers = [
  '京A12345',
  '沪B67890',
  '粤C33333',
  '京D88888',
  '沪A55555',
  '京A99999',
  '苏E11111',
  '浙F22222',
  '粤B76543',
  '杭A24680',
]
const visitReasons = [
  '商务洽谈',
  '项目交流',
  '合同签署',
  '产品演示',
  '设备维护',
  '面试沟通',
  '客户拜访',
  '技术交流',
]

const remainingStatuses: VisitorAppointmentStatus[] = [
  ...Array<VisitorAppointmentStatus>(16).fill('pending'),
  ...Array<VisitorAppointmentStatus>(34).fill('approved'),
  ...Array<VisitorAppointmentStatus>(15).fill('checked_in'),
  ...Array<VisitorAppointmentStatus>(21).fill('checked_out'),
  ...Array<VisitorAppointmentStatus>(8).fill('rejected'),
  ...Array<VisitorAppointmentStatus>(8).fill('cancelled'),
  ...Array<VisitorAppointmentStatus>(8).fill('expired'),
]

const leadingStatuses: VisitorAppointmentStatus[] = [
  'pending',
  'approved',
  'checked_in',
  'checked_out',
  'checked_out',
  'checked_in',
  'checked_out',
  'pending',
  'approved',
  'checked_in',
]

const statuses = [...leadingStatuses, ...remainingStatuses]

/**
 * 生成相对当前日期的本地 ISO 时间，保证核心预约始终可演示
 */
function createRelativeIso(dayOffset: number, hour: number, minute: number) {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  date.setDate(date.getDate() + dayOffset)
  return date.toISOString()
}

/**
 * 创建指定序号的访客预约种子数据
 */
function createVisitorAppointment(index: number): VisitorAppointmentDto {
  const status = statuses[index]
  const enterprise = seedEnterprises[index % 6]
  const hostCandidates = seedPersonnel.filter(
    (person) => person.enterpriseId === enterprise.id && person.status === 'active',
  )
  const host = hostCandidates[index % hostCandidates.length]
  const dayOffset = status === 'approved' || status === 'pending' ? 1 + (index % 5) : -(index % 12)
  const startHour = 9 + (index % 8)
  const scheduledStartAt = createRelativeIso(dayOffset, startHour, index % 2 === 0 ? 0 : 30)
  const scheduledEndAt = createRelativeIso(dayOffset, startHour + 1, index % 2 === 0 ? 0 : 30)
  const checkedInAt =
    status === 'checked_in' || status === 'checked_out'
      ? createRelativeIso(dayOffset, startHour, 5 + (index % 10))
      : null
  const checkedOutAt =
    status === 'checked_out' ? createRelativeIso(dayOffset, startHour + 1, 10 + (index % 12)) : null
  const createdAt = createRelativeIso(dayOffset - 2, 10, index % 60)

  return {
    id: `visit_${String(10_001 + index)}`,
    code: `V${scheduledStartAt.slice(0, 10).replaceAll('-', '')}${String(index + 1).padStart(4, '0')}`,
    visitorName: visitorNames[index % visitorNames.length],
    visitorPhone: `1${[3, 5, 8, 6, 7][index % 5]}${String(800_001_234 + index * 137).slice(-9)}`,
    hostId: host.id,
    hostName: host.name,
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    scheduledStartAt,
    scheduledEndAt,
    visitReason: visitReasons[index % visitReasons.length],
    plateNumber: index % 4 === 2 ? null : plateNumbers[index % plateNumbers.length],
    status,
    terminationReason:
      status === 'rejected' ? '来访信息不完整' : status === 'cancelled' ? '访客行程有变' : null,
    checkedInAt,
    checkedOutAt,
    createdBy: index % 3 === 0 ? 'usr_1002' : 'usr_1003',
    createdAt,
    updatedAt: checkedOutAt ?? checkedInAt ?? createdAt,
  }
}

/** 访客预约模块使用的 120 条初始数据 */
export const seedVisitorAppointments: VisitorAppointmentDto[] = Array.from(
  { length: 120 },
  (_, index) => createVisitorAppointment(index),
)
