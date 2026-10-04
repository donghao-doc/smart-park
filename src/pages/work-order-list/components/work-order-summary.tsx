import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Skeleton, Statistic } from 'antd'

import type { WorkOrderMetricDto } from '@/types/work-order'
import { workOrderStatusLabels } from '@/utils/work-order'
import './work-order-summary.scss'

interface WorkOrderSummaryProps {
  /** 当前可见范围内的五项状态统计 */
  summary?: WorkOrderMetricDto[]
  /** 是否正在请求统计 */
  loading: boolean
  /** 统计是否加载失败 */
  loadError: boolean
  /** 重新加载统计 */
  onRetry: () => void
}

const metrics = [
  { status: 'pending_acceptance', icon: <FileTextOutlined /> },
  { status: 'pending_processing', icon: <ClockCircleOutlined /> },
  { status: 'processing', icon: <SettingOutlined /> },
  { status: 'pending_confirmation', icon: <SafetyCertificateOutlined /> },
  { status: 'completed', icon: <CheckCircleOutlined /> },
] as const

/** 展示设计稿中的五项工单统计，上周数量由服务端按历史记录计算 */
function WorkOrderSummary({ summary, loading, loadError, onRetry }: WorkOrderSummaryProps) {
  if (loadError) {
    return (
      <Alert
        type="error"
        showIcon
        title="工单统计加载失败"
        action={
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        }
      />
    )
  }
  return (
    <section className="work-order-summary" aria-label="工单统计" aria-busy={loading}>
      <Row gutter={[12, 12]}>
        {metrics.map((metric) => {
          const value = summary?.find((item) => item.status === metric.status)
          return (
            <Col key={metric.status} xs={24} sm={12} lg={8} xl={{ flex: '1 1 20%' }}>
              <Card className={`work-order-metric-card is-${metric.status}`}>
                {value ? (
                  <Flex align="start" gap={16}>
                    <Flex
                      align="center"
                      justify="center"
                      className="work-order-metric-icon"
                      aria-hidden="true"
                    >
                      {metric.icon}
                    </Flex>
                    <div className="work-order-metric-content">
                      <Statistic
                        title={workOrderStatusLabels[metric.status]}
                        value={value.count}
                        suffix="件"
                      />
                      <Flex align="center" gap={10} className="work-order-metric-comparison">
                        <Flex
                          align="center"
                          gap={4}
                          className={`work-order-metric-change ${
                            value.change > 0 ? 'is-increase' : value.change < 0 ? 'is-decrease' : ''
                          }`}
                        >
                          {value.change > 0 ? <ArrowUpOutlined /> : null}
                          {value.change < 0 ? <ArrowDownOutlined /> : null}
                          <span>
                            {value.change > 0 ? '+' : ''}
                            {value.change}
                          </span>
                        </Flex>
                        <span>较上周</span>
                      </Flex>
                    </div>
                  </Flex>
                ) : (
                  <Skeleton active title={false} paragraph={{ rows: 3 }} />
                )}
              </Card>
            </Col>
          )
        })}
      </Row>
    </section>
  )
}

export default WorkOrderSummary
