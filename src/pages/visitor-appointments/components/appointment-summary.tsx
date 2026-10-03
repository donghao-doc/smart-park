import {
  ClockCircleOutlined,
  ExportOutlined,
  HourglassOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Row, Skeleton } from 'antd'

import type { VisitorAppointmentSummaryDto } from '@/types/visitor-appointment'

interface AppointmentSummaryProps {
  /** 预约状态统计，加载完成前为空 */
  summary?: VisitorAppointmentSummaryDto
  /** 统计接口是否加载失败 */
  loadError: boolean
}

const summaryItems = [
  { key: 'pending', label: '待审批', deltaKey: 'pendingDelta', icon: <HourglassOutlined /> },
  { key: 'approved', label: '待到访', deltaKey: 'approvedDelta', icon: <ClockCircleOutlined /> },
  { key: 'checkedIn', label: '已到访', deltaKey: 'checkedInDelta', icon: <UserOutlined /> },
  { key: 'checkedOut', label: '已离园', deltaKey: 'checkedOutDelta', icon: <ExportOutlined /> },
] as const

/**
 * 展示访客预约核心状态统计
 */
function AppointmentSummary({ summary, loadError }: AppointmentSummaryProps) {
  if (loadError) {
    return <Alert type="error" showIcon message="预约统计加载失败" />
  }

  return (
    <section aria-label="预约状态统计">
      <Row gutter={[14, 14]}>
        {summaryItems.map((item) => {
          const delta = summary?.[item.deltaKey]
          const deltaClassName = delta !== undefined && delta < 0 ? 'is-decrease' : 'is-increase'

          return (
            <Col key={item.key} xs={24} sm={12} xl={6}>
              <Card className={`appointment-metric-card is-${item.key}`}>
                {summary ? (
                  <div className="appointment-metric-content">
                    <div className="appointment-metric-icon" aria-hidden="true">{item.icon}</div>
                    <div>
                      <div className="appointment-metric-label">{item.label}</div>
                      <div className="appointment-metric-value">
                        {summary[item.key]}
                        <span>个</span>
                      </div>
                      <div className={`appointment-metric-delta ${deltaClassName}`}>
                        <span>
                          {delta !== undefined && delta > 0 ? '↑ +' : '↓ -'}{Math.abs(delta ?? 0)}
                        </span>
                        <span className="appointment-metric-compare">较上周</span>
                      </div>
                    </div>
                  </div>
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

export default AppointmentSummary
