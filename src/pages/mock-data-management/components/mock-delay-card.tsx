import { Card, Col, Flex, InputNumber, Row, Slider } from 'antd'
import './mock-delay-card.scss'

/** 接口延迟卡片的受控配置 */
interface MockDelayCardProps {
  /** 当前延迟值，单位毫秒，范围 0～2000 */
  value: number
  /** 保存、重置或无管理权限时禁用输入 */
  disabled: boolean
  /** 同步滑块或数值输入产生的有效延迟值 */
  onChange: (value: number) => void
}

/** 展示接口延迟配置，统一处理滑块与数值输入的范围约束 */
function MockDelayCard({ value, disabled, onChange }: MockDelayCardProps) {
  /** 忽略暂时清空的输入，并将延迟约束为支持范围内的整数 */
  function handleChange(nextValue: number | null) {
    if (nextValue === null) return
    onChange(Math.max(0, Math.min(2000, Math.round(nextValue))))
  }

  return (
    <Card className="mock-delay-card">
      <h2 className="mock-delay-title">接口延迟</h2>
      <p className="mock-delay-description">设置所有 Mock 接口的响应延迟时间，用于模拟网络环境</p>
      <Row gutter={[32, 16]} align="middle">
        <Col xs={24} sm={18} lg={20}>
          <Slider
            min={0}
            max={2000}
            step={50}
            marks={{ 0: '0', 500: '500', 2000: '2000' }}
            value={value}
            disabled={disabled}
            aria-label="Mock 接口响应延迟"
            tooltip={{ formatter: (delay) => `${delay} ms` }}
            onChange={handleChange}
          />
        </Col>
        <Col xs={24} sm={6} lg={4}>
          <Flex align="center" className="mock-delay-control">
            <InputNumber
              className="mock-delay-input"
              min={0}
              max={2000}
              precision={0}
              value={value}
              disabled={disabled}
              aria-label="接口延迟毫秒数"
              onChange={handleChange}
            />
            <span className="mock-delay-unit">ms</span>
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

export default MockDelayCard
