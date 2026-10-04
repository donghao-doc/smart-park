import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CarOutlined,
  ExportOutlined,
  ImportOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Skeleton, Statistic } from 'antd'

import type { ParkingRecordSummaryDto } from '@/types/parking-record'
import './parking-summary.scss'

interface ParkingSummaryProps {
  /** 当前账号可见范围的停车统计，初次加载时为空 */
  summary?: ParkingRecordSummaryDto
  /** 是否正在加载统计 */
  loading: boolean
  /** 统计接口是否失败 */
  loadError: boolean
  /** 重试统计请求 */
  onRetry: () => void
}

const metrics = [
  {
    key: 'currentParked',
    changeKey: 'parkedChange',
    label: '当前在场',
    comparison: '较上周',
    icon: <CarOutlined />,
    className: 'is-parked',
    tooltip: '包含在场和超时车辆，不含无权限拦截记录',
  },
  {
    key: 'todayEntries',
    changeKey: 'entriesChangePercent',
    label: '今日入场',
    comparison: '较昨日',
    icon: <ImportOutlined />,
    className: 'is-entry',
    tooltip: '今日实际入场的车辆，不含无权限拦截记录',
  },
  {
    key: 'todayExits',
    changeKey: 'exitsChangePercent',
    label: '今日出场',
    comparison: '较昨日',
    icon: <ExportOutlined />,
    className: 'is-exit',
    tooltip: '今日实际离场的车辆',
  },
  {
    key: 'abnormalVehicles',
    changeKey: 'abnormalChangePercent',
    label: '异常车辆',
    comparison: '较昨日',
    icon: <WarningOutlined />,
    className: 'is-abnormal',
    tooltip: '当前停车满 24 小时的车辆与今日无权限拦截合计',
  },
] as const

/** 展示四项停车指标，比较数据与列表使用同一批通行记录计算 */
function ParkingSummary({ summary, loading, loadError, onRetry }: ParkingSummaryProps) {
  if (loadError) {
    return (
      <Alert
        type="error"
        showIcon
        title="停车统计加载失败"
        action={
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        }
      />
    )
  }

  return (
    <section className="parking-summary" aria-label="停车统计" aria-busy={loading}>
      <Row gutter={[16, 16]}>
        {metrics.map((metric) => {
          const change = summary?.[metric.changeKey]
          const changeText =
            change == null
              ? '暂无基数'
              : `${change > 0 ? '+' : ''}${change}${metric.key === 'currentParked' ? '' : '%'}`
          return (
            <Col key={metric.key} xs={24} sm={12} xl={6}>
              <Card className={`parking-metric-card ${metric.className}`}>
                {summary ? (
                  <Flex align="start" gap={18}>
                    <Flex
                      align="center"
                      justify="center"
                      className="parking-metric-icon"
                      aria-hidden="true"
                    >
                      {metric.icon}
                    </Flex>
                    <div className="parking-metric-content">
                      <Statistic
                        title={<span title={metric.tooltip}>{metric.label}</span>}
                        value={summary[metric.key]}
                        suffix="辆"
                      />
                      <Flex align="center" gap={12} className="parking-metric-comparison">
                        <Flex
                          align="center"
                          gap={4}
                          className={`parking-metric-change ${
                            change != null && change > 0
                              ? 'is-increase'
                              : change != null && change < 0
                                ? 'is-decrease'
                                : ''
                          }`}
                        >
                          {change != null && change > 0 ? <ArrowUpOutlined /> : null}
                          {change != null && change < 0 ? <ArrowDownOutlined /> : null}
                          <span>{changeText}</span>
                        </Flex>
                        <span>{metric.comparison}</span>
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

export default ParkingSummary
