import type { EChartsOption } from 'echarts'
import { Alert, DatePicker, Empty, Segmented, Spin } from 'antd'

import EChartsView from '@/components/echarts-view'
import type { DashboardTrendRange } from '@/types/dashboard'
import './trend-chart-card.scss'

const { RangePicker } = DatePicker

/**
 * Dashboard 趋势图卡片属性
 */
export interface TrendChartCardProps {
  /** 卡片标题 */
  title: string
  /** 当前选择的趋势时间范围 */
  range: DashboardTrendRange
  /** 图表是否处于加载状态 */
  loading: boolean
  /** 图表数据是否加载失败 */
  error: boolean
  /** 当前是否存在可展示的数据 */
  hasData: boolean
  /** 接口异常时展示的提示 */
  errorMessage: string
  /** 无数据时展示的提示 */
  emptyDescription: string
  /** 图表的无障碍描述 */
  chartAriaLabel: string
  /** ECharts 图表配置 */
  option: EChartsOption
  /** 切换预设时间范围时触发 */
  onRangeChange: (range: DashboardTrendRange) => void
  /** 选择自定义日期范围时触发，日期格式为 YYYY-MM-DD */
  onCustomRangeChange: (dateStrings: [string, string]) => void
}

/**
 * 展示带时间范围筛选、状态反馈和 ECharts 图表的趋势卡片
 */
function TrendChartCard({
  title,
  range,
  loading,
  error,
  hasData,
  errorMessage,
  emptyDescription,
  chartAriaLabel,
  option,
  onRangeChange,
  onCustomRangeChange,
}: TrendChartCardProps) {
  return (
    <article className="dashboard-panel trend-chart-card">
      <div className="dashboard-panel-heading trend-chart-card-heading">
        <h2>{title}</h2>
        <Segmented<DashboardTrendRange>
          size="small"
          value={range}
          options={[
            { label: '近7日', value: '7d' },
            { label: '近30日', value: '30d' },
            { label: '自定义', value: 'custom' },
          ]}
          onChange={onRangeChange}
        />
      </div>

      {range === 'custom' && (
        <RangePicker
          className="trend-chart-card-range"
          size="small"
          format="YYYY-MM-DD"
          allowClear={false}
          onChange={(_, dateStrings) =>
            onCustomRangeChange(dateStrings as [string, string])
          }
        />
      )}

      <Spin spinning={loading}>
        {error ? (
          <Alert type="error" showIcon message={errorMessage} />
        ) : hasData ? (
          <EChartsView
            className="trend-chart-card-chart"
            ariaLabel={chartAriaLabel}
            option={option}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
        )}
      </Spin>
    </article>
  )
}

export default TrendChartCard
