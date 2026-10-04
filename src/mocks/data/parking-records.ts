import dayjs from 'dayjs'

import type { ParkingRecordDto, ParkingVehicleType } from '@/types/parking-record'
import { seedEnterprises } from './enterprises'

const samplePlates = [
  '京A8F72M', '沪B3K9D1', '粤B7G5N2', '浙A9H3K8', '苏D6L7P9',
  '京B2C4F6', '川A1Q8Z3', '鲁C5D9J7', '皖A0M2L8', '闽D8N6V1',
]
const prefixes = ['京A', '沪B', '粤B', '浙A', '苏D', '川A', '鲁C', '皖A']
const gates = ['东门', '南门', '西门', '北门']
const vehicleTypes: ParkingVehicleType[] = ['small', 'small', 'large', 'small', 'temporary']
const initializedAt = dayjs()

/** 生成正常进出、无权限拦截和超时未离场记录，时间不会晚于初始化时刻 */
function createParkingRecord(index: number): ParkingRecordDto {
  const enterprise = seedEnterprises[index % 12]
  const status = index % 10 === 4
    ? 'overtime'
    : index % 10 === 6
      ? 'unauthorized'
      : index < 40 && index % 2 === 0
        ? 'parked'
        : 'departed'
  const dayOffset = index < 80 ? Math.floor(index / 40) : 2 + index % 12
  const todayElapsed = initializedAt.diff(initializedAt.startOf('day'))
  const enteredAt = status === 'overtime'
    ? initializedAt.subtract(26 + index % 200, 'hour')
    : dayOffset === 0
      ? initializedAt.startOf('day').add(todayElapsed * (0.8 - index % 40 * 0.015), 'millisecond')
      : initializedAt.startOf('day')
        .subtract(dayOffset, 'day')
        .add(7, 'hour')
        .add(index % 40 * 16, 'minute')
  const exitedAt = status === 'departed'
    ? enteredAt.add(dayOffset === 0 ? todayElapsed * 0.08 : (33 + index % 180) * 60_000, 'millisecond')
    : null

  return {
    id: `parking_${10_001 + index}`,
    plateNumber: samplePlates[index] ?? `${prefixes[index % prefixes.length]}${10_000 + index}`,
    vehicleType: vehicleTypes[index % vehicleTypes.length],
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    entrance: gates[index % gates.length],
    enteredAt: enteredAt.toISOString(),
    exit: exitedAt ? gates[index % gates.length] : null,
    exitedAt: exitedAt?.toISOString() ?? null,
    status,
  }
}

/** 328 条只读停车记录，覆盖多个企业、日期和通行状态 */
export const seedParkingRecords: ParkingRecordDto[] = Array.from(
  { length: 328 },
  (_, index) => createParkingRecord(index),
)
