import { Alert, Button, Descriptions, Modal, Skeleton } from 'antd'

import type { ParkingRecordDto } from '@/types/parking-record'
import { formatDateTime } from '@/utils'
import { formatParkingDuration } from '@/utils/parking-record'
import { parkingVehicleTypeLabels } from '../parking-options'
import ParkingStatus from './parking-status'
import './parking-detail-modal.scss'

interface ParkingDetailModalProps {
  /** 是否打开详情 */
  open: boolean
  /** 接口返回的通行记录详情 */
  record?: ParkingRecordDto
  /** 详情是否正在加载 */
  loading: boolean
  /** 详情接口是否失败 */
  loadError: boolean
  /** 重试当前详情请求 */
  onRetry: () => void
  /** 关闭详情弹窗 */
  onClose: () => void
}

/** 展示通行快照，并解释超时与无权限两种异常状态 */
function ParkingDetailModal({
  open,
  record,
  loading,
  loadError,
  onRetry,
  onClose,
}: ParkingDetailModalProps) {
  return (
    <Modal
      className="parking-detail-modal"
      title="停车记录详情"
      open={open}
      width={720}
      footer={<Button onClick={onClose}>关闭</Button>}
      onCancel={onClose}
      destroyOnHidden
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="停车详情加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : record ? (
        <ParkingDetailContent record={record} />
      ) : null}
    </Modal>
  )
}

/** 完整详情内容，仅在记录加载成功后展示 */
function ParkingDetailContent({ record }: { /** 当前通行快照 */ record: ParkingRecordDto }) {
  return (
    <>
      {record.status === 'unauthorized' || record.status === 'overtime' ? (
        <Alert
          className="parking-detail-alert"
          type="warning"
          showIcon
          title={record.status === 'unauthorized'
            ? '车辆无通行权限，已在入口拦截，未实际入场'
            : '车辆连续停留已满 24 小时，请联系所属企业核实'}
        />
      ) : null}
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'plate', label: '车牌号', children: record.plateNumber },
          { key: 'status', label: '停车状态', children: <ParkingStatus status={record.status} /> },
          { key: 'type', label: '车辆类型', children: parkingVehicleTypeLabels[record.vehicleType] },
          { key: 'duration', label: '停留时长', children: formatParkingDuration(record) },
          {
            key: 'enterprise',
            label: '所属企业',
            children: record.enterpriseName,
            span: 'filled',
          },
          { key: 'entrance', label: '入口', children: record.entrance },
          { key: 'exit', label: '出口', children: record.exit ?? '-' },
          {
            key: 'entryTime',
            label: record.status === 'unauthorized' ? '识别时间' : '入场时间',
            children: formatDateTime(record.enteredAt),
          },
          {
            key: 'exitTime',
            label: '出场时间',
            children: record.exitedAt
              ? formatDateTime(record.exitedAt)
              : record.status === 'unauthorized' ? '未入场' : '尚未离场',
          },
        ]}
      />
    </>
  )
}

export default ParkingDetailModal
