import http from '@/http'
import type {
  ParkingRecordDto,
  ParkingRecordListParams,
  ParkingRecordPageResult,
  ParkingRecordSummaryDto,
} from '@/types/parking-record'

/** 分页查询当前账号可见的停车通行记录 */
export async function reqGetParkingRecords(params: ParkingRecordListParams = {}) {
  return http.get<ParkingRecordPageResult>('/parking-records', { params })
}

/** 查询在场、今日进出及异常车辆统计 */
export async function reqGetParkingRecordSummary() {
  return http.get<ParkingRecordSummaryDto>('/parking-records/summary')
}

/** 查询单条停车通行记录详情 */
export async function reqGetParkingRecord(recordId: string) {
  return http.get<ParkingRecordDto>(`/parking-records/${encodeURIComponent(recordId)}`)
}
