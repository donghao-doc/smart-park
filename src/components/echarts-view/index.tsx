import type { EChartsOption, EChartsType } from 'echarts'
import { init } from 'echarts/core'
import { useEffect, useRef } from 'react'

/**
 * 通用 ECharts 图表容器属性
 */
export interface EChartsViewProps {
  /** 图表的无障碍描述，用于向辅助技术说明图表内容 */
  ariaLabel: string
  /** 业务侧扩展样式类，用于定义容器尺寸和页面布局 */
  className?: string
  /** ECharts 图表配置 */
  option: EChartsOption
}

/**
 * 渲染可随容器尺寸变化的 ECharts 图表，并负责实例的创建与释放
 * 调用方需提前注册图表类型、组件和渲染器模块
 */
function EChartsView({ ariaLabel, className = '', option }: EChartsViewProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<EChartsType | null>(null)

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) {
      return
    }

    const chart = init(container)
    chartInstanceRef.current = chart
    let resizeFrame = 0
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => chart.resize())
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(resizeFrame)
      chartInstanceRef.current = null
      chart.dispose()
    }
  }, [])

  useEffect(() => {
    chartInstanceRef.current?.setOption(option)
  }, [option])

  return (
    <div
      ref={chartContainerRef}
      className={`echarts-view ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
    />
  )
}

export default EChartsView
