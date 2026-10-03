import { RightOutlined } from '@ant-design/icons'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { use as registerEChartsModules } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { Alert, Badge, Button, Empty, Spin } from 'antd'
import { useMemo } from 'react'

import EChartsView from '@/components/echarts-view'
import type { DeviceStatusDto } from '@/types/dashboard'
import './device-status-card.scss'

registerEChartsModules([PieChart, TooltipComponent, CanvasRenderer])

const deviceStatusColors: Record<DeviceStatusDto['key'], string> = {
  online: '#11b88b',
  offline: '#1677ff',
  warning: '#ff8a00',
  maintenance: '#8d9ab2',
}

/**
 * Dashboard 设备状态卡片属性
 */
export interface DeviceStatusCardProps {
  /** 各设备状态的数量与占比 */
  statuses: DeviceStatusDto[]
  /** 设备状态是否处于加载状态 */
  loading: boolean
  /** 设备状态是否加载失败 */
  error: boolean
  /** 点击查看更多时触发 */
  onViewMore: () => void
}

/**
 * 展示设备状态分布、在线设备数量及状态图例
 */
function DeviceStatusCard({
  statuses,
  loading,
  error,
  onViewMore,
}: DeviceStatusCardProps) {
  const option = useMemo<EChartsOption>(
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
          data: statuses.map((status) => ({
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
    [statuses],
  )

  return (
    <article className="dashboard-panel device-status-card">
      <div className="dashboard-panel-heading">
        <h2>设备状态</h2>
        <Button type="link" className="dashboard-view-more" onClick={onViewMore}>
          查看更多 <RightOutlined />
        </Button>
      </div>

      <Spin spinning={loading}>
        {error ? (
          <Alert type="error" showIcon message="设备状态加载失败" />
        ) : statuses.length > 0 ? (
          <div className="device-status-card-content">
            <EChartsView
              className="device-status-card-chart"
              ariaLabel="设备状态环形图"
              option={option}
            />
            <dl className="device-status-card-legend">
              {statuses.map((status) => (
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
  )
}

export default DeviceStatusCard
