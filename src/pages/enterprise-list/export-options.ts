import type { EnterpriseListItemDto } from '@/types/enterprise'
import type { ExcelExportOptions } from '@/utils/excel-export'

/** 入驻企业台账导出列，不包含序号和操作入口 */
export const enterpriseExportOptions: ExcelExportOptions<EnterpriseListItemDto> = {
  fileName: '企业管理',
  sheetName: '企业台账',
  columns: [
    { title: '企业名称', width: 36, value: (record) => record.name },
    { title: '统一社会信用代码', width: 26, value: (record) => record.creditCode },
    { title: '行业', width: 20, value: (record) => record.industry },
    { title: '联系人', width: 16, value: (record) => record.contactName },
    { title: '联系电话', width: 20, value: (record) => record.contactPhone },
    { title: '办公位置', width: 30, value: (record) => record.officeLocation },
    {
      title: '状态',
      width: 12,
      value: (record) => (record.status === 'active' ? '已入驻' : '已停用'),
    },
  ],
}
