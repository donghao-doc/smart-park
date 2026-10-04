import {
  ApartmentOutlined,
  BarChartOutlined,
  CarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Descriptions, Timeline } from 'antd'

import type { EnterpriseDetailDto } from '@/types/enterprise'
import './enterprise-information.scss'

interface EnterpriseInformationProps {
  /** 需要展示完整企业信息的企业详情 */
  enterprise: EnterpriseDetailDto
}

/**
 * 将 ISO 时间格式化为最近动态的时间文本
 */
function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
    .format(new Date(value))
    .replace('/', '-')
}

/**
 * 展示企业基本信息、联系人、关键数据、办公位置和最近动态
 */
function EnterpriseInformation({ enterprise }: EnterpriseInformationProps) {
  return (
    <div className="enterprise-detail-grid">
      <div className="enterprise-detail-main-column">
        <section className="enterprise-detail-panel enterprise-basic-panel">
          <h2>
            <ApartmentOutlined />
            基本信息
          </h2>
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            colon={false}
            items={[
              { key: 'name', label: '企业名称', children: enterprise.name },
              {
                key: 'creditCode',
                label: '统一社会信用代码',
                children: enterprise.creditCode,
              },
              {
                key: 'companyType',
                label: '企业类型',
                children: enterprise.companyType,
              },
              {
                key: 'foundedAt',
                label: '成立日期',
                children: enterprise.foundedAt,
              },
              {
                key: 'capital',
                label: '注册资本',
                children: enterprise.registeredCapital,
              },
              {
                key: 'industry',
                label: '所属行业',
                children: enterprise.industry,
              },
              {
                key: 'scope',
                label: '经营范围',
                span: { xs: 1, sm: 1, md: 2 },
                children: enterprise.businessScope,
              },
              {
                key: 'description',
                label: '企业简介',
                span: { xs: 1, sm: 1, md: 2 },
                children: enterprise.description,
              },
            ]}
          />
        </section>

        <section className="enterprise-detail-panel enterprise-contact-panel">
          <h2>
            <TeamOutlined />
            联系人信息
          </h2>
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            colon={false}
            items={[
              {
                key: 'contactName',
                label: '联系人',
                children: enterprise.contact.name,
              },
              {
                key: 'title',
                label: '职务',
                children: enterprise.contact.title,
              },
              {
                key: 'phone',
                label: '手机号码',
                children: enterprise.contact.phone,
              },
              {
                key: 'email',
                label: '邮箱',
                children: enterprise.contact.email,
              },
              {
                key: 'telephone',
                label: '座机电话',
                children: enterprise.contact.telephone,
              },
              {
                key: 'address',
                label: '联系地址',
                children: enterprise.contact.address,
              },
            ]}
          />
        </section>
      </div>

      <aside className="enterprise-detail-side-column">
        <section className="enterprise-detail-panel enterprise-metrics-panel">
          <h2>
            <BarChartOutlined />
            关键数据
          </h2>
          <div className="enterprise-metric-grid">
            <article>
              <span className="enterprise-metric-icon is-cyan">
                <TeamOutlined />
              </span>
              <div>
                <span>企业成员</span>
                <strong>
                  {enterprise.metrics.memberCount}
                  <small> 人</small>
                </strong>
              </div>
            </article>
            <article>
              <span className="enterprise-metric-icon is-purple">
                <CarOutlined />
              </span>
              <div>
                <span>备案车辆</span>
                <strong>
                  {enterprise.metrics.vehicleCount}
                  <small> 辆</small>
                </strong>
              </div>
            </article>
            <article>
              <span className="enterprise-metric-icon is-green">
                <FileTextOutlined />
              </span>
              <div>
                <span>关联工单</span>
                <strong>
                  {enterprise.metrics.workOrderCount}
                  <small> 件</small>
                </strong>
              </div>
            </article>
            <article>
              <span className="enterprise-metric-icon is-blue">
                <ApartmentOutlined />
              </span>
              <div>
                <span>入驻时长</span>
                <strong className="is-duration">{enterprise.metrics.tenancyDuration}</strong>
                <small>自 {enterprise.foundedAt}</small>
              </div>
            </article>
          </div>
        </section>

        <section className="enterprise-detail-panel enterprise-office-panel">
          <h2>
            <EnvironmentOutlined />
            办公位置
          </h2>
          <Descriptions
            column={1}
            colon={false}
            items={[
              {
                key: 'park',
                label: '园区',
                children: enterprise.office.parkName,
              },
              {
                key: 'building',
                label: '楼宇',
                children: enterprise.office.buildingName,
              },
              {
                key: 'floor',
                label: '楼层',
                children: enterprise.office.floorName,
              },
              {
                key: 'room',
                label: '办公区域',
                children: enterprise.office.roomName,
              },
              {
                key: 'address',
                label: '详细地址',
                children: enterprise.office.address,
              },
            ]}
          />
        </section>
      </aside>

      <section className="enterprise-detail-panel enterprise-activity-panel">
        <div className="enterprise-panel-heading">
          <h2>
            <ClockCircleOutlined />
            最近动态
          </h2>
          <Button type="link">查看更多</Button>
        </div>
        <Timeline
          items={enterprise.activities.map((activity) => ({
            color: '#1677ff',
            content: (
              <div className="enterprise-activity-item">
                <time>{formatActivityTime(activity.occurredAt)}</time>
                <span>{activity.content}</span>
              </div>
            ),
          }))}
        />
      </section>
    </div>
  )
}

export default EnterpriseInformation
