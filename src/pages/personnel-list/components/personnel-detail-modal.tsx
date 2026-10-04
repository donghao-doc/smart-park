import { Descriptions, Modal, Tag } from 'antd'

import type { PersonnelCertificateType, PersonnelDto, PersonnelStatus } from '@/types/personnel'
import './personnel-detail-modal.scss'

interface PersonnelDetailModalProps {
  /** 弹窗是否打开 */
  open: boolean
  /** 当前查看的人员详情 */
  personnel?: PersonnelDto
  /** 关闭详情弹窗 */
  onClose: () => void
}

const certificateTypeLabels: Record<PersonnelCertificateType, string> = {
  identity_card: '身份证',
  passport: '护照',
  hk_macao_permit: '港澳通行证',
}

const statusLabels: Record<PersonnelStatus, string> = {
  active: '在职',
  resigned: '离职',
  suspended: '停用',
}

/**
 * 展示人员完整档案信息
 */
function PersonnelDetailModal({ open, personnel, onClose }: PersonnelDetailModalProps) {
  return (
    <Modal
      className="personnel-detail-modal"
      open={open}
      title="人员详情"
      footer={null}
      width={680}
      destroyOnHidden
      onCancel={onClose}
    >
      {personnel ? (
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }}
          items={[
            { key: 'name', label: '姓名', children: personnel.name },
            { key: 'phone', label: '手机号', children: personnel.phone },
            {
              key: 'certificateType',
              label: '证件类型',
              children: certificateTypeLabels[personnel.certificateType],
            },
            {
              key: 'certificateNumber',
              label: '证件号码',
              children: personnel.certificateNumber,
            },
            {
              key: 'employeeNumber',
              label: '工号',
              children: personnel.employeeNumber,
            },
            {
              key: 'department',
              label: '部门',
              children: personnel.department,
            },
            {
              key: 'enterpriseName',
              label: '所属企业',
              children: personnel.enterpriseName,
              span: 2,
            },
            {
              key: 'status',
              label: '状态',
              children: (
                <Tag className={`personnel-detail-status is-${personnel.status}`} variant="filled">
                  {statusLabels[personnel.status]}
                </Tag>
              ),
            },
          ]}
        />
      ) : null}
    </Modal>
  )
}

export default PersonnelDetailModal
