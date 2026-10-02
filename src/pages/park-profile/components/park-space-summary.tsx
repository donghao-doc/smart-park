import {
  ApartmentOutlined,
  BarChartOutlined,
  BlockOutlined,
  DesktopOutlined,
} from '@ant-design/icons'

import type { ParkSpaceSummaryDto } from '../../../types/park-profile'
import './park-space-summary.scss'

interface ParkSpaceSummaryProps {
  /** 园区空间汇总指标 */
  summary: ParkSpaceSummaryDto
}

interface SummaryCardConfig {
  /** 汇总指标字段 */
  key: keyof ParkSpaceSummaryDto
  /** 指标名称 */
  title: string
  /** 指标单位 */
  unit: string
  /** 指标图标 */
  icon: React.ReactNode
  /** 卡片配色 */
  tone: 'blue' | 'green' | 'purple' | 'orange'
}

const summaryCards: SummaryCardConfig[] = [
  {
    key: 'buildingCount',
    title: '楼宇数量',
    unit: '栋',
    icon: <ApartmentOutlined />,
    tone: 'blue',
  },
  {
    key: 'floorCount',
    title: '楼层数量',
    unit: '层',
    icon: <BlockOutlined />,
    tone: 'green',
  },
  {
    key: 'spaceCount',
    title: '办公空间',
    unit: '间',
    icon: <DesktopOutlined />,
    tone: 'purple',
  },
  {
    key: 'usedSpaceCount',
    title: '已使用空间',
    unit: '间',
    icon: <BarChartOutlined />,
    tone: 'orange',
  },
]

/**
 * 展示园区楼宇、楼层与办公空间汇总指标
 */
function ParkSpaceSummary({ summary }: ParkSpaceSummaryProps) {
  return (
    <section className="park-summary-grid" aria-label="园区空间概况">
      {summaryCards.map((card) => (
        <article className="park-summary-card" key={card.key}>
          <div className={`park-summary-icon is-${card.tone}`} aria-hidden="true">
            {card.icon}
          </div>
          <div>
            <p>{card.title}</p>
            <strong>{summary[card.key].toLocaleString('zh-CN')}</strong>
            <span className="park-summary-unit">{card.unit}</span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default ParkSpaceSummary
