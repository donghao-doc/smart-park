import {
  BankFilled,
  BorderOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ProfileOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

import type { ParkInfoDto } from '../../../types/park-profile'
import './park-overview-card.scss'

interface ParkOverviewCardProps {
  /** 园区基础信息 */
  info: ParkInfoDto
  /** 当前用户是否拥有园区信息编辑权限 */
  canEdit: boolean
  /** 打开园区信息编辑弹窗 */
  onEdit: () => void
}

/**
 * 展示园区名称、定位和基础档案信息
 */
function ParkOverviewCard({ info, canEdit, onEdit }: ParkOverviewCardProps) {
  return (
    <section className="park-overview-card" aria-label="园区基础信息">
      <div className="park-identity">
        <div className="park-identity-icon" aria-hidden="true">
          <BankFilled />
        </div>
        <div className="park-identity-copy">
          <h2>{info.name}</h2>
          <p>以科技创新为核心，打造集研发办公、产业孵化、商务配套于一体的现代化智慧园区。</p>
        </div>
      </div>

      <div className="park-basic-information">
        <div className="park-basic-heading">
          <h2>基本信息</h2>
          {canEdit ? (
            <Tooltip title="编辑园区信息">
              <Button
                type="text"
                shape="circle"
                className="park-basic-edit-button"
                icon={<EditOutlined />}
                aria-label="编辑园区信息"
                onClick={onEdit}
              />
            </Tooltip>
          ) : null}
        </div>
        <dl className="park-basic-grid">
          <div className="park-basic-item">
            <dt>
              <EnvironmentOutlined />园区地址
            </dt>
            <dd>{info.address}</dd>
          </div>
          <div className="park-basic-item">
            <dt>
              <UserOutlined />联系人
            </dt>
            <dd>{info.contactName}</dd>
          </div>
          <div className="park-basic-item">
            <dt>
              <PhoneOutlined />联系电话
            </dt>
            <dd>{info.contactPhone}</dd>
          </div>
          <div className="park-basic-item">
            <dt>
              <BorderOutlined />园区面积
            </dt>
            <dd>{info.area.toLocaleString('zh-CN')} m²</dd>
          </div>
          <div className="park-basic-item park-basic-description">
            <dt>
              <ProfileOutlined />园区介绍
            </dt>
            <dd>{info.description}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default ParkOverviewCard
