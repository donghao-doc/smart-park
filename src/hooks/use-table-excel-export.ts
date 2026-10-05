import { App, type TableProps } from 'antd'
import { useCallback, useRef, useState, type Key } from 'react'

import type { TableExportActionsProps } from '@/components/table-export-actions'
import { exportExcelRecords, type ExcelExportOptions } from '@/utils/excel-export'

/** 列表记录必须提供不随分页或业务字段变化的唯一标识 */
interface IdentifiedRecord {
  /** 接口返回的稳定记录 ID，与表格 rowKey 保持一致 */
  id: string
}

/** 业务列表可复用的跨页选择、导出操作及清空能力 */
export interface TableExcelExport<RecordType> {
  /** 透传给 Ant Design Table 的受控勾选配置 */
  rowSelection: NonNullable<TableProps<RecordType>['rowSelection']>
  /** 透传给公共导出工具栏的状态和操作 */
  exportActions: TableExportActionsProps
  /** 筛选、刷新或保存后清空所有页面的选择和数据缓存 */
  clearSelection: () => void
}

/**
 * 缓存已勾选的完整业务记录，保留跨页选择并导出全部已选数据
 * 业务页面在筛选、刷新或修改数据后主动调用 clearSelection
 */
export function useTableExcelExport<RecordType extends IdentifiedRecord>(
  records: RecordType[],
  options: ExcelExportOptions<RecordType>,
  disabled: boolean,
): TableExcelExport<RecordType> {
  const { message } = App.useApp()
  const [selectedRecords, setSelectedRecords] = useState(() => new Map<Key, RecordType>())
  const [exporting, setExporting] = useState(false)
  const exportPending = useRef(false)

  /** 释放所有已选行，避免不同筛选条件或数据版本之间混用 */
  const clearSelection = useCallback(() => {
    setSelectedRecords(new Map())
  }, [])

  /** 按全部已选 ID 重建缓存，取消当前页选择不会丢失其他页的记录 */
  function handleSelectionChange(keys: Key[], rows: RecordType[]) {
    if (disabled || exportPending.current) return

    setSelectedRecords((previous) => {
      const available = new Map(previous)
      for (const record of rows) available.set(record.id, record)
      // 当前页接口结果优先于 Ant Design 内部保存的行快照
      for (const record of records) available.set(record.id, record)

      const next = new Map<Key, RecordType>()
      for (const key of keys) {
        const record = available.get(key)
        if (record) next.set(key, record)
      }
      return next
    })
  }

  /** 导出点击时的选择快照，失败时保留选择供用户重试 */
  async function handleExport() {
    if (disabled || exportPending.current || selectedRecords.size === 0) return
    exportPending.current = true
    setExporting(true)

    try {
      const currentRecords = new Map(records.map((record) => [record.id, record]))
      const selected = Array.from(
        selectedRecords.values(),
        (record) => currentRecords.get(record.id) ?? record,
      )
      await exportExcelRecords(selected, options)
      void message.success(`已导出 ${selected.length} 条记录`)
    } catch {
      void message.error('Excel 导出失败，请重试')
    } finally {
      exportPending.current = false
      setExporting(false)
    }
  }

  return {
    rowSelection: {
      selectedRowKeys: Array.from(selectedRecords.keys()),
      preserveSelectedRowKeys: true,
      onChange: handleSelectionChange,
      getCheckboxProps: () => ({ disabled: disabled || exporting }),
      columnWidth: 44,
    },
    exportActions: {
      selectedCount: selectedRecords.size,
      exporting,
      disabled,
      onExport: () => void handleExport(),
    },
    clearSelection,
  }
}
