import {
  BankOutlined,
  CarOutlined,
  DesktopOutlined,
  ProfileOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import type { DashboardMetricDto, DashboardMetricKey } from '../../../types/dashboard'
import './metric-card.scss'

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

interface MetricCardProps {
  /** 核心运营指标及其趋势信息 */
  metric: DashboardMetricDto
}

/**
 * 展示核心运营指标，并提供对应业务列表入口
 */
function MetricCard({ metric }: MetricCardProps) {
  const navigate = useNavigate()
  const presentation = metricPresentation[metric.key]
  const isHealthyDecrease = metric.key === 'vehicle' || metric.key === 'workOrder'
  const isBeneficial = metric.direction === 'down' && isHealthyDecrease

  return (
    <Button
      type="text"
      className="dashboard-metric-card"
      onClick={() => void navigate(presentation.path)}
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

export default MetricCard
