import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { graphic, use as registerEChartsModules } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { Alert, Skeleton } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  reqGetDashboardSummary,
  reqGetDashboardTasks,
  reqGetDeviceStatuses,
  reqGetVisitorTrend,
  reqGetWorkOrderTrend,
} from '@/api/dashboard'
import type {
  DashboardSummaryDto,
  DashboardTaskDto,
  DashboardTrendParams,
  DashboardTrendRange,
  DeviceStatusDto,
  VisitorTrendPointDto,
  WorkOrderTrendPointDto,
} from '@/types/dashboard'
import MetricCard from './components/metric-card'
import DeviceStatusCard from './components/device-status-card'
import TodayTasksCard from './components/today-tasks-card'
import TrendChartCard from './components/trend-chart-card'
import './dashboard.scss'

registerEChartsModules([
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

/**
 * 将趋势日期压缩为横轴使用的月日格式
 */
function formatTrendDate(value: string) {
  return value.slice(5)
}

/**
 * 运营总览页面，展示园区核心指标、趋势、待办和设备状态
 */
function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummaryDto>()
  const [summaryError, setSummaryError] = useState(false)
  const [tasks, setTasks] = useState<DashboardTaskDto[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(false)
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatusDto[]>([])
  const [deviceLoading, setDeviceLoading] = useState(true)
  const [deviceError, setDeviceError] = useState(false)
  const [visitorTrend, setVisitorTrend] = useState<VisitorTrendPointDto[]>([])
  const [visitorLoading, setVisitorLoading] = useState(true)
  const [visitorError, setVisitorError] = useState(false)
  const [visitorParams, setVisitorParams] = useState<DashboardTrendParams>({ range: '7d' })
  const [workOrderTrend, setWorkOrderTrend] = useState<WorkOrderTrendPointDto[]>([])
  const [workOrderLoading, setWorkOrderLoading] = useState(true)
  const [workOrderError, setWorkOrderError] = useState(false)
  const [workOrderParams, setWorkOrderParams] = useState<DashboardTrendParams>({ range: '7d' })

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await reqGetDashboardSummary()
        if (active) {
          setSummary(data)
          setSummaryError(false)
        }
      } catch {
        if (active) {
          setSummaryError(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await reqGetVisitorTrend(visitorParams)
        if (active) {
          setVisitorTrend(data)
          setVisitorError(false)
        }
      } catch {
        if (active) {
          setVisitorError(true)
        }
      } finally {
        if (active) {
          setVisitorLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [visitorParams])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await reqGetWorkOrderTrend(workOrderParams)
        if (active) {
          setWorkOrderTrend(data)
          setWorkOrderError(false)
        }
      } catch {
        if (active) {
          setWorkOrderError(true)
        }
      } finally {
        if (active) {
          setWorkOrderLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [workOrderParams])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await reqGetDashboardTasks()
        if (active) {
          setTasks(data)
          setTasksError(false)
        }
      } catch {
        if (active) {
          setTasksError(true)
        }
      } finally {
        if (active) {
          setTasksLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await reqGetDeviceStatuses()
        if (active) {
          setDeviceStatuses(data)
          setDeviceError(false)
        }
      } catch {
        if (active) {
          setDeviceError(true)
        }
      } finally {
        if (active) {
          setDeviceLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const visitorOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 500,
      color: ['#1677ff'],
      tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => `${value} 人` },
      grid: { left: 48, right: 18, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: visitorTrend.map((item) => formatTrendDate(item.date)),
        axisLine: { lineStyle: { color: '#dce5f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#667493', fontSize: 12, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        name: '人数',
        min: 0,
        max: 500,
        interval: 100,
        nameTextStyle: { color: '#7885a0', fontSize: 12, padding: [0, 0, 0, -26] },
        axisLabel: { color: '#667493', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e7edf5' } },
      },
      series: [
        {
          name: '访客人数',
          type: 'line',
          data: visitorTrend.map((item) => item.value),
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: visitorTrend.length <= 7,
          lineStyle: { width: 2, color: '#1677ff' },
          itemStyle: { color: '#1677ff', borderColor: '#fff', borderWidth: 2 },
          label: {
            show: visitorTrend.length <= 7,
            position: 'top',
            color: '#142552',
            fontSize: 12,
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(22, 119, 255, 0.20)' },
              { offset: 1, color: 'rgba(22, 119, 255, 0.01)' },
            ]),
          },
        },
      ],
    }),
    [visitorTrend],
  )

  const workOrderOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 500,
      color: ['#1677ff', '#11b88b'],
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        right: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 28,
        textStyle: { color: '#53617c', fontSize: 12 },
      },
      grid: { left: 48, right: 18, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: workOrderTrend.map((item) => formatTrendDate(item.date)),
        axisLine: { lineStyle: { color: '#dce5f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#667493', fontSize: 12, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        name: '工单数',
        min: 0,
        max: 100,
        interval: 20,
        nameTextStyle: { color: '#7885a0', fontSize: 12, padding: [0, 0, 0, -18] },
        axisLabel: { color: '#667493', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e7edf5' } },
      },
      series: [
        {
          name: '新增工单',
          type: 'line',
          data: workOrderTrend.map((item) => item.created),
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: workOrderTrend.length <= 7,
          lineStyle: { width: 2 },
          label: {
            show: workOrderTrend.length <= 7,
            position: 'top',
            color: '#142552',
            fontSize: 12,
          },
          areaStyle: { color: 'rgba(22, 119, 255, 0.06)' },
        },
        {
          name: '完成工单',
          type: 'line',
          data: workOrderTrend.map((item) => item.completed),
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: workOrderTrend.length <= 7,
          lineStyle: { width: 2 },
          label: {
            show: workOrderTrend.length <= 7,
            position: 'bottom',
            color: '#142552',
            fontSize: 12,
          },
          areaStyle: { color: 'rgba(17, 184, 139, 0.05)' },
        },
      ],
    }),
    [workOrderTrend],
  )

  /**
   * 切换趋势预设范围，自定义范围默认选中设计稿对应的最近七日
   */
  function handleTrendRangeChange(target: 'visitor' | 'workOrder', range: DashboardTrendRange) {
    const params: DashboardTrendParams =
      range === 'custom'
        ? { range, startDate: '2024-04-16', endDate: '2024-04-22' }
        : { range }

    if (target === 'visitor') {
      setVisitorLoading(true)
      setVisitorParams(params)
    } else {
      setWorkOrderLoading(true)
      setWorkOrderParams(params)
    }
  }

  /**
   * 应用用户选择的趋势自定义日期范围
   */
  function handleCustomRangeChange(
    target: 'visitor' | 'workOrder',
    dateStrings: [string, string],
  ) {
    const [startDate, endDate] = dateStrings
    if (!startDate || !endDate) {
      return
    }

    const params: DashboardTrendParams = { range: 'custom', startDate, endDate }
    if (target === 'visitor') {
      setVisitorLoading(true)
      setVisitorParams(params)
    } else {
      setWorkOrderLoading(true)
      setWorkOrderParams(params)
    }
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-metrics" aria-label="园区核心指标">
        {summaryError ? (
          <Alert className="dashboard-section-error" type="error" showIcon message="核心指标加载失败" />
        ) : summary ? (
          summary.metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))
        ) : (
          Array.from({ length: 6 }, (_, index) => (
            <div className="dashboard-metric-skeleton" key={index}>
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </div>
          ))
        )}
      </section>

      <section className="dashboard-trends" aria-label="运营趋势">
        <TrendChartCard
          title="近7日访客趋势"
          range={visitorParams.range}
          loading={visitorLoading}
          error={visitorError}
          hasData={visitorTrend.length > 0}
          errorMessage="访客趋势加载失败"
          emptyDescription="暂无访客数据"
          chartAriaLabel="访客人数趋势折线图"
          option={visitorOption}
          onRangeChange={(range) => handleTrendRangeChange('visitor', range)}
          onCustomRangeChange={(dateStrings) =>
            handleCustomRangeChange('visitor', dateStrings)
          }
        />

        <TrendChartCard
          title="工单趋势"
          range={workOrderParams.range}
          loading={workOrderLoading}
          error={workOrderError}
          hasData={workOrderTrend.length > 0}
          errorMessage="工单趋势加载失败"
          emptyDescription="暂无工单数据"
          chartAriaLabel="新增与完成工单趋势折线图"
          option={workOrderOption}
          onRangeChange={(range) => handleTrendRangeChange('workOrder', range)}
          onCustomRangeChange={(dateStrings) =>
            handleCustomRangeChange('workOrder', dateStrings)
          }
        />
      </section>

      <section className="dashboard-details" aria-label="今日待办和设备状态">
        <TodayTasksCard
          tasks={tasks}
          loading={tasksLoading}
          error={tasksError}
          onViewMore={() => void navigate('/work-orders')}
          onProcessTask={(task) => void navigate(task.actionPath)}
        />

        <DeviceStatusCard
          statuses={deviceStatuses}
          loading={deviceLoading}
          error={deviceError}
          onViewMore={() => void navigate('/devices')}
        />
      </section>
    </div>
  )
}

export default DashboardPage
