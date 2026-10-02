import { Flex, Pagination, Table, type PaginationProps, type TableProps } from 'antd'

import type { ReactNode } from 'react'

import useTableScrollHeight from './use-table-scroll-height'
import './data-table-panel.scss'

interface DataTablePanelPagination {
  /** 当前页码 */
  current: number
  /** 当前每页数据条数 */
  pageSize: number
  /** 满足条件的数据总数 */
  total: number
  /** 是否允许切换每页条数，默认开启 */
  showSizeChanger?: boolean
  /** 可选择的每页条数 */
  pageSizeOptions?: PaginationProps['pageSizeOptions']
  /** 总数区域的自定义渲染方法 */
  showTotal?: PaginationProps['showTotal']
  /** 页码或每页条数变化后的回调 */
  onChange: (page: number, pageSize: number) => void
}

interface DataTablePanelProps<RecordType extends object> {
  /** 面板的无障碍区域名称 */
  ariaLabel: string
  /** 表格上方的业务操作区 */
  toolbar?: ReactNode
  /** 表格上方的错误或状态反馈区 */
  feedback?: ReactNode
  /** 透传给 Ant Design Table 的业务属性，不包含滚动和分页配置 */
  tableProps: Omit<TableProps<RecordType>, 'pagination' | 'scroll'>
  /** 表格横向滚动宽度 */
  scrollX?: NonNullable<TableProps<RecordType>['scroll']>['x']
  /** 表体最小可滚动高度，默认 120px */
  minimumBodyHeight?: number
  /** 独立分页器配置 */
  pagination: DataTablePanelPagination
  /** 业务页面需要追加的语义化类名 */
  className?: string
}

/**
 * 通用数据表格面板，统一工具栏、反馈、内部滚动和底部分页交互
 */
function DataTablePanel<RecordType extends object>({
  ariaLabel,
  toolbar,
  feedback,
  tableProps,
  scrollX,
  minimumBodyHeight = 120,
  pagination,
  className,
}: DataTablePanelProps<RecordType>) {
  const { tableRegionRef, tableScrollHeight } = useTableScrollHeight(minimumBodyHeight)
  const panelClassName = ['data-table-panel', className].filter(Boolean).join(' ')

  /**
   * 同步独立分页器状态，改变每页条数时统一回到第一页
   */
  function handlePaginationChange(nextPage: number, nextPageSize: number) {
    const targetPage = nextPageSize === pagination.pageSize ? nextPage : 1
    pagination.onChange(targetPage, nextPageSize)
  }

  return (
    <section className={panelClassName} aria-label={ariaLabel}>
      {toolbar ? (
        <Flex className="data-table-panel-toolbar" align="center" justify="space-between">
          {toolbar}
        </Flex>
      ) : null}

      {feedback ? <div className="data-table-panel-feedback">{feedback}</div> : null}

      <div ref={tableRegionRef} className="data-table-panel-scroll-region">
        <Table<RecordType>
          {...tableProps}
          scroll={{ x: scrollX, y: tableScrollHeight }}
          pagination={false}
        />
      </div>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger={pagination.showSizeChanger ?? true}
        pageSizeOptions={pagination.pageSizeOptions ?? [10, 20, 50]}
        showTotal={pagination.showTotal ?? ((count) => `共 ${count} 条记录`)}
        onChange={handlePaginationChange}
      />
    </section>
  )
}

export { default as DataTablePageLayout } from './data-table-page-layout'
export default DataTablePanel
