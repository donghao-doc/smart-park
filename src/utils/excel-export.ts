import dayjs from 'dayjs'
import type { SheetData } from 'write-excel-file/browser'

/** Excel 导出的业务列定义，文本输出可保留编码和电话号码的完整值 */
export interface ExcelExportColumn<RecordType> {
  /** 中文表头，不包含表格中的操作列 */
  title: string
  /** Excel 列宽，单位为字符宽度 */
  width: number
  /** 将业务字段转换为最终导出的展示文本 */
  value: (record: RecordType) => string
}

/** 单个业务列表的 Excel 文件配置 */
export interface ExcelExportOptions<RecordType> {
  /** 文件名称前缀，导出时追加本地时间和 .xlsx 扩展名 */
  fileName: string
  /** Excel 工作表名称 */
  sheetName: string
  /** 按导出顺序排列的业务列 */
  columns: ExcelExportColumn<RecordType>[]
}

/** 按需加载 Excel 库并下载已选数据，首行作为表头固定 */
export async function exportExcelRecords<RecordType>(
  records: RecordType[],
  options: ExcelExportOptions<RecordType>,
) {
  if (records.length === 0) return

  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const data: SheetData = [
    options.columns.map((column) => ({
      value: column.title,
      type: String,
      fontWeight: 'bold',
      backgroundColor: '#EAF2FF',
    })),
    // 显式使用文本单元格，保留长编码及前导零，也避免内容被识别为公式
    ...records.map((record) =>
      options.columns.map((column) => ({ value: column.value(record), type: String })),
    ),
  ]

  await writeExcelFile(data, {
    sheet: options.sheetName,
    columns: options.columns.map((column) => ({ width: column.width })),
    stickyRowsCount: 1,
  }).toFile(`${options.fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
}
