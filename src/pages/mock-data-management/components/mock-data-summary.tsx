import { ClockCircleOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons'
import { Card, Col, Flex, Row } from 'antd'
import type { MockDataDto } from '@/types/mock-data'
import { formatDateTime } from '@/utils/date-time'
import './mock-data-summary.scss'

interface MockDataSummaryProps {
  /** 当前本地种子数据版本与最近恢复时间 */
  data: MockDataDto
}

/** 展示标准种子数据、本地版本和最近恢复时间 */
function MockDataSummary({ data }: MockDataSummaryProps) {
  return (
    <Card className="mock-data-summary" aria-label="Mock 数据概况">
      <Row gutter={[32, 24]}>
        <Col xs={24} md={8} className="mock-data-summary-column">
          <Flex align="start" gap={24}>
            <Flex
              align="center"
              justify="center"
              className="mock-data-summary-icon is-seed"
              aria-hidden="true"
            >
              <DatabaseOutlined />
            </Flex>
            <div className="mock-data-summary-content">
              <h2>标准种子数据</h2>
              <p>系统内置的标准演示数据，用于本地 Mock 环境</p>
            </div>
          </Flex>
        </Col>
        <Col xs={24} md={8} className="mock-data-summary-column">
          <Flex align="start" gap={24}>
            <Flex
              align="center"
              justify="center"
              className="mock-data-summary-icon is-version"
              aria-hidden="true"
            >
              <FileTextOutlined />
            </Flex>
            <div className="mock-data-summary-content">
              <h2>本地数据版本</h2>
              <strong className="mock-data-summary-value">{data.version}</strong>
              <p>当前使用的本地 Mock 数据版本</p>
            </div>
          </Flex>
        </Col>
        <Col xs={24} md={8} className="mock-data-summary-column">
          <Flex align="start" gap={24}>
            <Flex
              align="center"
              justify="center"
              className="mock-data-summary-icon is-reset"
              aria-hidden="true"
            >
              <ClockCircleOutlined />
            </Flex>
            <div className="mock-data-summary-content">
              <h2>最近重置时间</h2>
              <strong className="mock-data-summary-value is-time">
                {data.lastResetAt ? formatDateTime(data.lastResetAt) : '尚未重置'}
              </strong>
              <p>上次恢复初始数据的时间</p>
            </div>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default MockDataSummary
