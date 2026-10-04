import type { ParkingRecordDto } from '@/types/parking-record'

/** 计算停留时长，被入口拦截的车辆不产生停车时长 */
export function formatParkingDuration(record: ParkingRecordDto, now = Date.now()) {
  if (record.status === 'unauthorized') return '-'
  const end = record.exitedAt ? new Date(record.exitedAt).getTime() : now
  const minutes = Math.max(0, Math.floor((end - new Date(record.enteredAt).getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}小时${minutes % 60}分钟` : `${minutes}分钟`
}
