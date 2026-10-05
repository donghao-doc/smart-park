import { DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

/** 表格跨页勾选和导出的工具栏操作 */
export interface TableExportActionsProps {
  /** 所有已勾选页面的记录总数 */
  selectedCount: number
  /** 是否正在生成和下载 Excel 文件 */
  exporting: boolean
  /** 列表加载或请求失败时暂停导出 */
  disabled: boolean
  /** 导出所有已勾选的记录 */
  onExport: () => void
}

/** 提供统一的 Excel 导出入口，按钮展示跨页已选记录总数 */
function TableExportActions({
  selectedCount,
  exporting,
  disabled,
  onExport,
}: TableExportActionsProps) {
  return (
    <Button
      icon={<DownloadOutlined />}
      loading={exporting}
      disabled={disabled || selectedCount === 0}
      onClick={onExport}
    >
      导出已选（{selectedCount}）
    </Button>
  )
}

export default TableExportActions
