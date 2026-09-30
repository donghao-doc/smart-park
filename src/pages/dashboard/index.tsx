import {
  BankOutlined,
  CarOutlined,
  DesktopOutlined,
  ProfileOutlined,
  RightOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { graphic, init, use as registerEChartsModules } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { Alert, Badge, Button, DatePicker, Empty, Segmented, Skeleton, Spin, Table, Tag } from 'antd'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import {
  reqGetDashboardSummary,
  reqGetDashboardTasks,
  reqGetDeviceStatuses,
  reqGetVisitorTrend,
  reqGetWorkOrderTrend,
} from '../../api/dashboard'
import type {
  DashboardMetricDto,
  DashboardMetricKey,
  DashboardSummaryDto,
  DashboardTaskDto,
  DashboardTaskPriority,
  DashboardTrendParams,
  DashboardTrendRange,
  DeviceStatusDto,
  VisitorTrendPointDto,
  WorkOrderTrendPointDto,
} from '../../types/dashboard'
import './dashboard.scss'

registerEChartsModules([
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

const { RangePicker } = DatePicker

const metricPresentation: Record<
  DashboardMetricKey,
  { icon: ReactNode; className: string; path: string }
> = {
  enterprise: { icon: <BankOutlined />, className: 'is-blue', path: '/enterprises' },
  personnel: { icon: <TeamOutlined />, className: 'is-green', path: '/personnel' },
  visitor: {
    icon: <UserAddOutlined />,
    className: 'is-cyan',
    path: '/visitors/records?date=today',
  },
  vehicle: {
    icon: <CarOutlined />,
    className: 'is-indigo',
    path: '/parking/records?status=present',
  },
  workOrder: {
    icon: <ProfileOutlined />,
    className: 'is-orange',
    path: '/work-orders?status=pending',
  },
  device: {
    icon: <DesktopOutlined />,
    className: 'is-teal',
    path: '/devices?status=online',
  },
}

const taskPriorityPresentation: Record<
  DashboardTaskPriority,
  { label: string; className: string }
> = {
  high: { label: '高', className: 'is-high' },
  medium: { label: '中', className: 'is-medium' },
  low: { label: '低', className: 'is-low' },
}

const deviceStatusColors: Record<DeviceStatusDto['key'], string> = {
  online: '#11b88b',
  offline: '#1677ff',
  warning: '#ff8a00',
  maintenance: '#8d9ab2',
}

interface DashboardChartProps {
  ariaLabel: string
  className?: string
  option: EChartsOption
}

/**
 * 创建可随容器尺寸变化的 ECharts 图表，并在组件卸载时释放实例
 */
function DashboardChart({ ariaLabel, className = '', option }: DashboardChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) {
      return
    }

    const chart = init(container)
    chart.setOption(option)
    let resizeFrame = 0
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => chart.resize())
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(resizeFrame)
      chart.dispose()
    }
  }, [option])

  return (
    <div
      ref={chartContainerRef}
      className={`dashboard-chart ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
    />
  )
}

interface MetricCardProps {
  metric: DashboardMetricDto
  onNavigate: (path: string) => void
}

/**
 * 展示核心运营指标，并提供对应业务列表入口
 */
function MetricCard({ metric, onNavigate }: MetricCardProps) {
  const presentation = metricPresentation[metric.key]
  const isHealthyDecrease = metric.key === 'vehicle' || metric.key === 'workOrder'
  const isBeneficial = metric.direction === 'down' && isHealthyDecrease

  return (
    <Button
      type="text"
      className="dashboard-metric-card"
      onClick={() => onNavigate(presentation.path)}
    >
      <span className={`dashboard-metric-icon ${presentation.className}`} aria-hidden="true">
        {presentation.icon}
      </span>
      <span className="dashboard-metric-content">
        <span className="dashboard-metric-title">{metric.title}</span>
        <span className="dashboard-metric-value-row">
          <strong>{metric.value.toLocaleString('zh-CN')}</strong>
          <span>{metric.unit}</span>
        </span>
        <span className="dashboard-metric-comparison">
          <span className={isBeneficial ? 'is-positive' : 'is-negative'}>
            {metric.direction === 'up' ? '↑' : '↓'} {metric.change}
          </span>
          <span>{metric.comparison}</span>
        </span>
      </span>
    </Button>
  )
}

/**
 * 将趋势日期压缩为横轴使用的月日格式
 */
function formatTrendDate(value: string) {
  return value.slice(5)
}

/**
 * 将待办创建时间格式化为月日与时分
 */
function formatTaskTime(value: string) {
  const [date, time] = value.split('T')
  return `${date.slice(5)}  ${time.slice(0, 5)}`
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

  const deviceOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 600,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 台（{d}%）' },
      series: [
        {
          name: '设备状态',
          type: 'pie',
          radius: ['62%', '86%'],
          center: ['50%', '50%'],
          startAngle: 90,
          clockwise: true,
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { scaleSize: 5 },
          data: deviceStatuses.map((status) => ({
            name: status.label,
            value: status.value,
            itemStyle: { color: deviceStatusColors[status.key] },
            ...(status.key === 'online'
              ? {
                  label: {
                    show: true,
                    position: 'center' as const,
                    formatter: `{value|${status.value}}\n{name|在线设备}`,
                    rich: {
                      value: {
                        color: '#0d1d4b',
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: 38,
                      },
                      name: { color: '#667493', fontSize: 12, lineHeight: 20 },
                    },
                  },
                }
              : {}),
          })),
        },
      ],
    }),
    [deviceStatuses],
  )

  const taskColumns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 46,
      render: (_: unknown, __: DashboardTaskDto, index: number) => index + 1,
    },
    { title: '任务标题', dataIndex: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'category', width: 114 },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 96,
      render: (priority: DashboardTaskPriority) => {
        const presentation = taskPriorityPresentation[priority]
        return <Tag className={`dashboard-priority-tag ${presentation.className}`}>{presentation.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 146,
      render: (value: string) => formatTaskTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 82,
      render: (_: unknown, task: DashboardTaskDto) => (
        <Button type="link" className="dashboard-task-action" onClick={() => void navigate(task.actionPath)}>
          去处理
        </Button>
      ),
    },
  ]

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
            <MetricCard key={metric.key} metric={metric} onNavigate={(path) => void navigate(path)} />
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
        <article className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading">
            <h2>近7日访客趋势</h2>
            <Segmented<DashboardTrendRange>
              size="small"
              value={visitorParams.range}
              options={[
                { label: '近7日', value: '7d' },
                { label: '近30日', value: '30d' },
                { label: '自定义', value: 'custom' },
              ]}
              onChange={(value) => handleTrendRangeChange('visitor', value)}
            />
          </div>
          {visitorParams.range === 'custom' && (
            <RangePicker
              className="dashboard-range-picker"
              size="small"
              format="YYYY-MM-DD"
              allowClear={false}
              onChange={(_, dateStrings) =>
                handleCustomRangeChange('visitor', dateStrings as [string, string])
              }
            />
          )}
          <Spin spinning={visitorLoading}>
            {visitorError ? (
              <Alert type="error" showIcon message="访客趋势加载失败" />
            ) : visitorTrend.length > 0 ? (
              <DashboardChart ariaLabel="访客人数趋势折线图" option={visitorOption} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无访客数据" />
            )}
          </Spin>
        </article>

        <article className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading">
            <h2>工单趋势</h2>
            <Segmented<DashboardTrendRange>
              size="small"
              value={workOrderParams.range}
              options={[
                { label: '近7日', value: '7d' },
                { label: '近30日', value: '30d' },
                { label: '自定义', value: 'custom' },
              ]}
              onChange={(value) => handleTrendRangeChange('workOrder', value)}
            />
          </div>
          {workOrderParams.range === 'custom' && (
            <RangePicker
              className="dashboard-range-picker"
              size="small"
              format="YYYY-MM-DD"
              allowClear={false}
              onChange={(_, dateStrings) =>
                handleCustomRangeChange('workOrder', dateStrings as [string, string])
              }
            />
          )}
          <Spin spinning={workOrderLoading}>
            {workOrderError ? (
              <Alert type="error" showIcon message="工单趋势加载失败" />
            ) : workOrderTrend.length > 0 ? (
              <DashboardChart ariaLabel="新增与完成工单趋势折线图" option={workOrderOption} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无工单数据" />
            )}
          </Spin>
        </article>
      </section>

      <section className="dashboard-details" aria-label="今日待办和设备状态">
        <article className="dashboard-panel dashboard-task-panel">
          <div className="dashboard-panel-heading">
            <h2>今日待办任务</h2>
            <Button type="link" className="dashboard-view-more" onClick={() => void navigate('/work-orders')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          {tasksError ? (
            <Alert type="error" showIcon message="今日待办加载失败" />
          ) : (
            <Table<DashboardTaskDto>
              className="dashboard-task-table"
              rowKey="id"
              columns={taskColumns}
              dataSource={tasks}
              loading={tasksLoading}
              pagination={false}
              size="small"
              scroll={{ x: 680 }}
            />
          )}
        </article>

        <article className="dashboard-panel dashboard-device-panel">
          <div className="dashboard-panel-heading">
            <h2>设备状态</h2>
            <Button type="link" className="dashboard-view-more" onClick={() => void navigate('/devices')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Spin spinning={deviceLoading}>
            {deviceError ? (
              <Alert type="error" showIcon message="设备状态加载失败" />
            ) : deviceStatuses.length > 0 ? (
              <div className="dashboard-device-content">
                <DashboardChart
                  className="dashboard-device-chart"
                  ariaLabel="设备状态环形图"
                  option={deviceOption}
                />
                <dl className="dashboard-device-legend">
                  {deviceStatuses.map((status) => (
                    <div key={status.key}>
                      <dt>
                        <Badge color={deviceStatusColors[status.key]} />
                        {status.label}
                      </dt>
                      <dd>
                        <strong>{status.value}</strong>
                        <span>{status.percentage}%</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无设备数据" />
            )}
          </Spin>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage
