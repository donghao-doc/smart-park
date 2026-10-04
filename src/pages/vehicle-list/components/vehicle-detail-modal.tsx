import { Alert, Button, Descriptions, Modal, Spin } from 'antd'

import type { VehicleDto } from '@/types/vehicle'
import { formatDateTime } from '@/utils'
import VehicleTag from './vehicle-tag'
import './vehicle-detail-modal.scss'

interface VehicleDetailModalProps {
  /** 详情弹窗是否打开 */
  open: boolean
  /** 当前车辆的完整档案 */
  vehicle?: VehicleDto
  /** 详情是否正在加载 */
  loading: boolean
  /** 详情请求是否失败 */
  loadError: boolean
  /** 重新请求车辆详情 */
  onRetry: () => void
  /** 关闭详情弹窗 */
  onClose: () => void
}

/** 查看车辆完整档案，提供独立加载、错误反馈与重试能力 */
function VehicleDetailModal({
  open,
  vehicle,
  loading,
  loadError,
  onRetry,
  onClose,
}: VehicleDetailModalProps) {
  return (
    <Modal
      className="vehicle-detail-modal"
      open={open}
      title="车辆详情"
      footer={<Button onClick={onClose}>关闭</Button>}
      width={680}
      destroyOnHidden
      onCancel={onClose}
    >
      {loading ? (
        <Spin description="正在加载车辆档案"><div className="vehicle-detail-loading" /></Spin>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="车辆档案加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : vehicle ? (
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }}
          items={[
            { key: 'plateNumber', label: '车牌号', children: vehicle.plateNumber },
            { key: 'type', label: '车辆类型', children: <VehicleTag value={vehicle.type} /> },
            { key: 'ownerName', label: '车主', children: vehicle.ownerName },
            { key: 'phone', label: '联系电话', children: vehicle.phone },
            {
              key: 'enterpriseName',
              label: '所属企业',
              children: vehicle.enterpriseName,
              span: 'filled',
            },
            { key: 'status', label: '状态', children: <VehicleTag value={vehicle.status} /> },
            { key: 'createdAt', label: '创建时间', children: formatDateTime(vehicle.createdAt) },
            {
              key: 'updatedAt',
              label: '更新时间',
              children: formatDateTime(vehicle.updatedAt),
              span: 'filled',
            },
          ]}
        />
      ) : null}
    </Modal>
  )
}

export default VehicleDetailModal
