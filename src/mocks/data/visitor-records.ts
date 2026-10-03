import dayjs from 'dayjs'

import type { VisitorRecordDto, VisitorRecordStatus } from '@/types/visitor-record'
import { seedEnterprises } from './enterprises'
import { seedPersonnel } from './personnel'

const visitorNames = ['李明', '张强', '王芳', '赵磊', '陈静', '刘伟', '杨洋', '黄磊', '周敏', '吴磊']
const statuses: VisitorRecordStatus[] = ['checked_out', 'checked_in', 'checked_in', 'expired', 'checked_out']
const reasons = ['商务洽谈', '项目交流', '客户拜访', '技术交流', '设备维护', '面试沟通']

/** 生成覆盖多个日期、企业和到访状态的历史记录，时间始终早于初始化时刻 */
function createVisitorRecord(index: number): VisitorRecordDto {
  const enterprise = seedEnterprises[index % 6]
  const hosts = seedPersonnel.filter((person) => person.enterpriseId === enterprise.id)
  const host = hosts[index % hosts.length]
  // 前两组用于演示今日、昨日统计，其余记录覆盖更早日期
  const dayOffset = index < 80 ? Math.floor(index / 40) : 2 + index % 8
  const now = dayjs()
  const elapsedToday = now.diff(now.startOf('day'))
  // 凌晨也保留今日演示记录，所有进出时间都落在当前时刻之前
  const duration = dayOffset === 0 ? Math.min(3_600_000, elapsedToday * 0.08) : 3_600_000
  const scheduled = dayOffset === 0
    ? now.startOf('day').add(elapsedToday * (0.6 - (index % 40) * 0.01), 'millisecond')
    : now.startOf('day').subtract(dayOffset, 'day').add(9, 'hour').add((index % 40) * 15, 'minute')
  const status = statuses[(index + Math.floor(index / 10)) % statuses.length]
  const checkedIn = status === 'expired' ? null : scheduled.add(duration / 12, 'millisecond')

  return {
    id: `record_${10_001 + index}`,
    code: `V${scheduled.format('YYYYMMDD')}${String(index + 1).padStart(4, '0')}`,
    visitorName: visitorNames[index % visitorNames.length],
    visitorPhone: `138${String(10_001_234 + index * 137).padStart(8, '0')}`,
    hostName: host.name,
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    scheduledStartAt: scheduled.toISOString(),
    scheduledEndAt: scheduled.add(duration, 'millisecond').toISOString(),
    visitReason: reasons[index % reasons.length],
    plateNumber: index % 3 === 0 ? `京A${String(12_345 + index)}` : null,
    status,
    checkedInAt: checkedIn?.toISOString() ?? null,
    checkedOutAt: status === 'checked_out' ? checkedIn!.add(duration * 0.75, 'millisecond').toISOString() : null,
  }
}

/** 128 条只读历史记录，接口同时合并预约模块实时产生的到访记录 */
export const seedVisitorRecords: VisitorRecordDto[] = Array.from(
  { length: 128 },
  (_, index) => createVisitorRecord(index),
)
