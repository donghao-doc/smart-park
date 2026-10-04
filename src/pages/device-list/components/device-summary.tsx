import {
  CheckCircleFilled,
  DesktopOutlined,
  DisconnectOutlined,
  PauseCircleFilled,
  WarningFilled,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Skeleton, Statistic } from 'antd'

import type { DeviceSummaryDto } from '@/types/device'
import './device-summary.scss'

interface DeviceSummaryProps {
  /** 全园区统计，独立于筛选条件 */
  summary?: DeviceSummaryDto
  /** 是否正在加载统计 */
  loading: boolean
  /** 是否加载失败 */
  loadError: boolean
  /** 重试统计请求 */
  onRetry: () => void
}

const metrics = [
  { key: 'total', label: '设备总数', icon: <DesktopOutlined /> },
  { key: 'normal', label: '正常', icon: <CheckCircleFilled /> },
  { key: 'fault', label: '故障', icon: <WarningFilled /> },
  { key: 'offline', label: '离线', icon: <DisconnectOutlined /> },
  { key: 'disabled', label: '停用', icon: <PauseCircleFilled /> },
] as const

/** 展示设备总数与四种状态数量，占比按接口统计实时计算 */
function DeviceSummary({ summary, loading, loadError, onRetry }: DeviceSummaryProps) {
  if (loadError) {
    return (
      <Alert
        type="error"
        showIcon
        title="设备统计加载失败"
        action={
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        }
      />
    )
  }
  return (
    <section className="device-summary" aria-label="设备状态统计" aria-busy={loading}>
      <Row gutter={[12, 12]}>
        {metrics.map(({ key, label, icon }) => {
          const count = summary ? (key === 'total' ? summary.total : summary.counts[key]) : 0
          const percentage = summary?.total ? Math.round((count / summary.total) * 100) : 0
          return (
            <Col key={key} xs={24} sm={12} lg={8} xl={{ flex: '1 1 20%' }}>
              <Card className={`device-metric-card is-${key}`}>
                {summary ? (
                  <Flex align="start" gap={16}>
                    <Flex
                      align="center"
                      justify="center"
                      className="device-metric-icon"
                      aria-hidden="true"
                    >
                      {icon}
                    </Flex>
                    <Flex vertical flex={1} gap={8} className="device-metric-content">
                      <span className="device-metric-label">{label}</span>
                      <Flex align="baseline" justify="space-between" gap={8} wrap>
                        <Statistic value={count} suffix="台" />
                        {key !== 'total' ? (
                          <span className="device-metric-percentage">{percentage}%</span>
                        ) : null}
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  <Skeleton active title={false} paragraph={{ rows: 2 }} />
                )}
              </Card>
            </Col>
          )
        })}
      </Row>
    </section>
  )
}

export default DeviceSummary
