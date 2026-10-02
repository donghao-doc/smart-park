import { useEffect, useRef, useState } from 'react'

const DEFAULT_TABLE_SCROLL_HEIGHT = 240
const DEFAULT_TABLE_HEADER_HEIGHT = 47

/**
 * 根据表格容器的剩余高度计算 Ant Design Table 表体滚动高度
 * @param minimumHeight 表体允许使用的最小高度
 * @returns 表格容器引用和当前表体滚动高度
 */
function useTableScrollHeight(minimumHeight: number) {
  const tableRegionRef = useRef<HTMLDivElement>(null)
  const [tableScrollHeight, setTableScrollHeight] = useState(DEFAULT_TABLE_SCROLL_HEIGHT)

  useEffect(() => {
    const tableRegion = tableRegionRef.current
    if (!tableRegion) {
      return
    }

    // 表体只占用扣除表头后的剩余高度，确保底部分页器始终可见
    function updateTableScrollHeight() {
      const currentTableRegion = tableRegionRef.current
      if (!currentTableRegion) {
        return
      }

      const tableHeader = currentTableRegion.querySelector<HTMLElement>('.ant-table-header')
      const headerHeight = tableHeader?.offsetHeight ?? DEFAULT_TABLE_HEADER_HEIGHT
      const nextHeight = Math.max(minimumHeight, currentTableRegion.clientHeight - headerHeight)
      setTableScrollHeight(nextHeight)
    }

    updateTableScrollHeight()
    const resizeObserver = new ResizeObserver(updateTableScrollHeight)
    resizeObserver.observe(tableRegion)

    return () => resizeObserver.disconnect()
  }, [minimumHeight])

  return { tableRegionRef, tableScrollHeight }
}

export default useTableScrollHeight
