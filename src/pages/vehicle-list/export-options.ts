import type { VehicleDto } from '@/types/vehicle'
import { formatDateTime } from '@/utils'
import type { ExcelExportOptions } from '@/utils/excel-export'
import { vehicleStatusLabels, vehicleTypeLabels } from './vehicle-options'

/** 车辆档案导出列，类型、状态和时间沿用页面展示格式 */
export const vehicleExportOptions: ExcelExportOptions<VehicleDto> = {
  fileName: '车辆档案',
  sheetName: '车辆档案',
  columns: [
    { title: '车牌号', width: 18, value: (record) => record.plateNumber },
    { title: '车辆类型', width: 14, value: (record) => vehicleTypeLabels[record.type] },
    { title: '车主', width: 16, value: (record) => record.ownerName },
    { title: '所属企业', width: 36, value: (record) => record.enterpriseName },
    { title: '联系电话', width: 20, value: (record) => record.phone },
    { title: '状态', width: 12, value: (record) => vehicleStatusLabels[record.status] },
    { title: '更新时间', width: 22, value: (record) => formatDateTime(record.updatedAt) },
  ],
}
