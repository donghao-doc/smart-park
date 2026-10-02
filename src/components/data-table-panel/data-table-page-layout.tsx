import { Flex } from 'antd'

import type { ReactNode } from 'react'

interface DataTablePageLayoutProps {
  /** 筛选区域、表格面板及其他需要参与页面高度分配的内容 */
  children: ReactNode
  /** 页面业务需要追加的语义化类名 */
  className?: string
}

/**
 * 数据列表页通用满高布局，阻止页面级滚动并为表格面板保留剩余空间
 */
function DataTablePageLayout({ children, className }: DataTablePageLayoutProps) {
  const layoutClassName = ['data-table-page-layout', className].filter(Boolean).join(' ')

  return (
    <Flex vertical gap={16} className={layoutClassName}>
      {children}
    </Flex>
  )
}

export default DataTablePageLayout
