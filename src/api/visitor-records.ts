import http from '@/http'
import type {
  VisitorRecordDto,
  VisitorRecordListParams,
  VisitorRecordPageResult,
  VisitorRecordSummaryDto,
} from '@/types/visitor-record'

/** 分页查询只读到访记录 */
export async function reqGetVisitorRecords(params: VisitorRecordListParams = {}) {
  return http.get<VisitorRecordPageResult>('/visitor-records', { params })
}

/** 查询当前账号可见范围的今日到访、离园统计 */
export async function reqGetVisitorRecordSummary() {
  return http.get<VisitorRecordSummaryDto>('/visitor-records/summary')
}

/** 查询指定到访记录的完整详情 */
export async function reqGetVisitorRecord(recordId: string) {
  return http.get<VisitorRecordDto>(`/visitor-records/${encodeURIComponent(recordId)}`)
}
