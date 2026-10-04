import { Alert, Button, Descriptions, Empty, Flex, Spin, Timeline } from 'antd'

import ScrollableModal from '@/components/scrollable-modal'
import type { DeviceDetailDto } from '@/types/device'
import { formatDateTime } from '@/utils'
import { deviceStatusLabels, deviceTypeLabels } from '@/utils/device'
import DeviceStatusTag from './device-status'
import './device-detail-modal.scss'

interface DeviceDetailModalProps {
  /** 是否打开详情 */
  open: boolean
  /** 设备档案及最近状态记录 */
  device?: DeviceDetailDto
  /** 是否正在加载详情 */
  loading: boolean
  /** 是否加载失败 */
  loadError: boolean
  /** 重试详情请求 */
  onRetry: () => void
  /** 关闭详情 */
  onClose: () => void
}

/** 展示设备基本信息和最近 20 条状态变化记录 */
function DeviceDetailModal({ open, device, loading, loadError, onRetry, onClose }: DeviceDetailModalProps) {
  return (
    <ScrollableModal
      className="device-detail-modal"
      open={open}
      title="设备详情"
      width={720}
      destroyOnHidden
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
    >
      {loading ? (
        <Spin description="正在加载设备详情"><div className="device-detail-loading" /></Spin>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="设备详情加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : device ? (
        <Flex vertical gap={24}>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 2 }}
            items={[
              { key: 'code', label: '设备编码', children: device.code },
              { key: 'name', label: '设备名称', children: device.name },
              { key: 'type', label: '设备类型', children: deviceTypeLabels[device.type] },
              { key: 'location', label: '位置', children: device.location },
              { key: 'ownerName', label: '责任人', children: device.ownerName },
              { key: 'status', label: '状态', children: <DeviceStatusTag status={device.status} /> },
              { key: 'createdAt', label: '创建时间', children: formatDateTime(device.createdAt) },
              { key: 'updatedAt', label: '更新时间', children: formatDateTime(device.updatedAt) },
            ]}
          />
          <section aria-label="最近状态变化记录">
            <h3 className="device-history-title">最近状态变化记录</h3>
            {device.statusRecords.length ? (
              <Timeline
                items={device.statusRecords.map((record) => ({
                  color: record.status === 'fault' ? 'red' : record.status === 'normal' ? 'green' : 'blue',
                  content: (
                    <Flex vertical gap={6}>
                      <Flex align="center" gap={8} wrap>
                        <span>{record.previousStatus ? deviceStatusLabels[record.previousStatus] : '登记设备'}</span>
                        <span aria-hidden="true">→</span>
                        <DeviceStatusTag status={record.status} />
                      </Flex>
                      <span className="device-history-meta">
                        {formatDateTime(record.changedAt)} · {record.operatorName}
                      </span>
                    </Flex>
                  ),
                }))}
              />
            ) : <Empty description="暂无状态变化记录" />}
          </section>
        </Flex>
      ) : null}
    </ScrollableModal>
  )
}

export default DeviceDetailModal
