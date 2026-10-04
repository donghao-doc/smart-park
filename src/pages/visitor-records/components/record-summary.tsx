import { ArrowDownOutlined, ArrowUpOutlined, ExportOutlined, TeamOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Skeleton, Statistic } from 'antd'

import type { VisitorRecordSummaryDto } from '@/types/visitor-record'
import './record-summary.scss'

interface RecordSummaryProps {
  /** 当前账号可见范围的统计，加载完成前为空 */
  summary?: VisitorRecordSummaryDto
  /** 统计接口是否失败 */
  loadError: boolean
  /** 重试统计请求 */
  onRetry: () => void
}

const metrics = [
  {
    key: 'todayArrivals',
    changeKey: 'arrivalsChangePercent',
    label: '今日到访',
    icon: <TeamOutlined />,
    className: 'is-arrival',
  },
  {
    key: 'todayDepartures',
    changeKey: 'departuresChangePercent',
    label: '今日离园',
    icon: <ExportOutlined />,
    className: 'is-departure',
  },
] as const

/** 展示今日到访、离园人数和较昨日变化，统计不受列表筛选影响 */
function RecordSummary({ summary, loadError, onRetry }: RecordSummaryProps) {
  if (loadError) {
    return (
      <Alert
        type="error"
        showIcon
        title="到访统计加载失败"
        action={
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        }
      />
    )
  }

  return (
    <section className="record-summary" aria-label="今日到访统计">
      <Row gutter={[16, 16]}>
        {metrics.map((metric) => {
          const change = summary?.[metric.changeKey]
          return (
            <Col key={metric.key} xs={24} md={12}>
              <Card className={`record-metric-card ${metric.className}`}>
                {summary ? (
                  <Flex align="center" gap={20}>
                    <Flex
                      align="center"
                      justify="center"
                      className="record-metric-icon"
                      aria-hidden="true"
                    >
                      {metric.icon}
                    </Flex>
                    <Statistic
                      className="record-metric-statistic"
                      title={metric.label}
                      value={summary[metric.key]}
                      suffix="人"
                    />
                    <div className="record-metric-comparison">
                      <div className="record-metric-compare-label">较昨日</div>
                      <Flex
                        align="center"
                        gap={4}
                        className={`record-metric-change ${
                          change != null && change > 0
                            ? 'is-increase'
                            : change != null && change < 0
                              ? 'is-decrease'
                              : ''
                        }`}
                      >
                        {change != null && change > 0 ? <ArrowUpOutlined /> : null}
                        {change != null && change < 0 ? <ArrowDownOutlined /> : null}
                        <span>
                          {change == null ? '暂无基数' : `${change > 0 ? '+' : ''}${change}%`}
                        </span>
                      </Flex>
                    </div>
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

export default RecordSummary
