import type { DeviceDto } from '@/types/device'
import { formatDateTime } from '@/utils'
import { deviceStatusLabels, deviceTypeLabels } from '@/utils/device'
import type { ExcelExportOptions } from '@/utils/excel-export'

/** 设备档案导出列，与列表中的业务字段及中文文案保持一致 */
export const deviceExportOptions: ExcelExportOptions<DeviceDto> = {
  fileName: '设备管理',
  sheetName: '设备档案',
  columns: [
    { title: '设备编码', width: 22, value: (record) => record.code },
    { title: '设备名称', width: 32, value: (record) => record.name },
    { title: '设备类型', width: 18, value: (record) => deviceTypeLabels[record.type] },
    { title: '位置', width: 30, value: (record) => record.location },
    { title: '责任人', width: 16, value: (record) => record.ownerName },
    { title: '状态', width: 12, value: (record) => deviceStatusLabels[record.status] },
    { title: '更新时间', width: 22, value: (record) => formatDateTime(record.updatedAt) },
  ],
}
