import { Alert, AutoComplete, Button, Col, Form, Input, Row, Select, Spin } from 'antd'
import { useEffect } from 'react'

import ScrollableModal from '@/components/scrollable-modal'
import type { DeviceDetailDto, DeviceMutationRequest } from '@/types/device'
import {
  deviceCodePattern,
  deviceStatusOptions,
  deviceTypeOptions,
  normalizeDeviceCode,
} from '@/utils/device'
import './device-form-modal.scss'

interface DeviceFormModalProps {
  /** 是否打开表单 */
  open: boolean
  /** 编辑时加载的完整设备档案 */
  device?: DeviceDetailDto
  /** 是否编辑现有设备 */
  editing: boolean
  /** 是否正在加载详情 */
  loading: boolean
  /** 详情是否加载失败 */
  loadError: boolean
  /** 已登记的位置建议，允许输入新位置 */
  locations: string[]
  /** 是否拥有独立状态修改权限 */
  canChangeStatus: boolean
  /** 是否正在保存 */
  submitting: boolean
  /** 提交已校验的设备档案 */
  onSubmit: (values: DeviceMutationRequest) => void
  /** 重试详情加载 */
  onRetry: () => void
  /** 关闭弹窗 */
  onCancel: () => void
}

/** 设备新增编辑弹窗，统一字段校验和独立状态权限 */
function DeviceFormModal({
  open,
  device,
  editing,
  loading,
  loadError,
  locations,
  canChangeStatus,
  submitting,
  onSubmit,
  onRetry,
  onCancel,
}: DeviceFormModalProps) {
  const [form] = Form.useForm<DeviceMutationRequest>()
  useEffect(() => {
    if (!open || loading || loadError) return
    form.resetFields()
    form.setFieldsValue(device ?? { type: 'camera', status: 'normal' })
  }, [device, form, loadError, loading, open])

  return (
    <ScrollableModal
      className="device-form-modal"
      open={open}
      title={editing ? '编辑设备' : '新增设备'}
      width={680}
      okText={editing ? '保存' : '创建'}
      cancelText="取消"
      destroyOnHidden
      confirmLoading={submitting}
      okButtonProps={{ disabled: loading || loadError || (editing && !device) }}
      cancelButtonProps={{ disabled: submitting }}
      closable={!submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      {loading ? (
        <Spin description="正在加载设备档案">
          <div className="device-form-loading" />
        </Spin>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="设备档案加载失败"
          action={
            <Button size="small" onClick={onRetry}>
              重试
            </Button>
          }
        />
      ) : (
        <Form
          name="device-form"
          form={form}
          layout="vertical"
          disabled={submitting}
          onFinish={onSubmit}
        >
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="设备编码"
                normalize={normalizeDeviceCode}
                rules={[
                  { required: true, message: '请输入设备编码' },
                  {
                    pattern: deviceCodePattern,
                    message: '使用 3～30 位字母、数字、连字符或下划线',
                  },
                ]}
              >
                <Input placeholder="如 DEV001，编码不可重复" maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="设备名称"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入设备名称',
                  },
                  { max: 60, message: '设备名称不能超过 60 个字符' },
                ]}
              >
                <Input placeholder="请输入设备名称" maxLength={60} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="设备类型"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select options={deviceTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="位置"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入设备位置',
                  },
                  { max: 60, message: '位置不能超过 60 个字符' },
                ]}
              >
                <AutoComplete
                  options={locations.map((value) => ({ value }))}
                  filterOption={(input, option) => String(option?.value).includes(input)}
                >
                  <Input placeholder="选择已有位置或输入新位置" maxLength={60} />
                </AutoComplete>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="ownerName"
                label="责任人"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入责任人姓名',
                  },
                  { max: 30, message: '责任人姓名不能超过 30 个字符' },
                ]}
              >
                <Input placeholder="请输入责任人姓名" maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择设备状态' }]}
              >
                <Select
                  options={deviceStatusOptions}
                  disabled={submitting || (editing && !canChangeStatus)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </ScrollableModal>
  )
}

export default DeviceFormModal
