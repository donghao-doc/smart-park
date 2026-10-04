import { Alert, Button, Col, Form, Input, Modal, Row, Select, Spin, type SelectProps } from 'antd'
import { useEffect } from 'react'

import type { VehicleDto, VehicleMutationRequest } from '@/types/vehicle'
import { normalizeVehiclePlate, vehiclePlatePattern } from '@/utils/vehicle'
import { vehicleStatusOptions, vehicleTypeOptions } from '../vehicle-options'
import './vehicle-form-modal.scss'

interface VehicleFormModalProps {
  /** 表单弹窗是否打开 */
  open: boolean
  /** 编辑车辆的完整档案，新增时不传 */
  vehicle?: VehicleDto
  /** 是否处于编辑模式 */
  editing: boolean
  /** 是否正在加载编辑详情 */
  loading: boolean
  /** 编辑详情是否加载失败 */
  loadError: boolean
  /** 可选择的全部企业 */
  enterpriseOptions: SelectProps['options']
  /** 企业选项是否正在加载 */
  optionsLoading: boolean
  /** 企业选项是否加载失败 */
  optionsError: boolean
  /** 当前账号是否可启停车辆 */
  canChangeStatus: boolean
  /** 是否正在提交 */
  submitting: boolean
  /** 提交已校验的车辆资料 */
  onSubmit: (values: VehicleMutationRequest) => void
  /** 重新加载编辑详情 */
  onRetry: () => void
  /** 重新加载企业选项 */
  onRetryOptions: () => void
  /** 关闭弹窗 */
  onCancel: () => void
}

/** 车辆新增与编辑表单，校验普通和新能源车牌并限制独立启停权限 */
function VehicleFormModal({
  open,
  vehicle,
  editing,
  loading,
  loadError,
  enterpriseOptions,
  optionsLoading,
  optionsError,
  canChangeStatus,
  submitting,
  onSubmit,
  onRetry,
  onRetryOptions,
  onCancel,
}: VehicleFormModalProps) {
  const [form] = Form.useForm<VehicleMutationRequest>()

  useEffect(() => {
    if (!open || loading || loadError) return
    // 仅在表单已挂载且详情可用时回填，切换新增模式时清除上一辆车的数据
    form.resetFields()
    form.setFieldsValue(vehicle ?? { type: 'employee', status: 'active' })
  }, [form, loadError, loading, open, vehicle])

  return (
    <Modal
      className="vehicle-form-modal"
      open={open}
      title={editing ? '编辑车辆' : '新增车辆'}
      okText={editing ? '保存' : '创建'}
      cancelText="取消"
      width={680}
      destroyOnHidden
      confirmLoading={submitting}
      okButtonProps={{ disabled: loading || loadError || optionsLoading || optionsError }}
      cancelButtonProps={{ disabled: submitting }}
      closable={!submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      {loading ? (
        <Spin description="正在加载车辆档案"><div className="vehicle-form-loading" /></Spin>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="车辆档案加载失败"
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : (
        <Form
          name="vehicle-form"
          form={form}
          layout="vertical"
          requiredMark
          disabled={submitting}
          onFinish={onSubmit}
        >
          {optionsError ? (
            <Alert
              className="vehicle-form-feedback"
              type="warning"
              showIcon
              title="所属企业选项加载失败，请重试后保存"
              action={<Button size="small" onClick={onRetryOptions}>重试</Button>}
            />
          ) : null}
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="plateNumber"
                label="车牌号"
                normalize={(value: string) => normalizeVehiclePlate(value)}
                rules={[
                  { required: true, message: '请输入车牌号' },
                  { pattern: vehiclePlatePattern, message: '请输入有效的普通或新能源车牌号' },
                ]}
              >
                <Input placeholder="如浙A12345、浙AD12345" maxLength={12} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="车辆类型"
                rules={[{ required: true, message: '请选择车辆类型' }]}
              >
                <Select options={vehicleTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="ownerName"
                label="车主"
                rules={[
                  { required: true, whitespace: true, message: '请输入车主姓名' },
                  { max: 30, message: '车主姓名不能超过 30 个字符' },
                ]}
              >
                <Input placeholder="请输入车主姓名" maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" maxLength={11} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="enterpriseId"
                label="所属企业"
                rules={[{ required: true, message: '请选择所属企业' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择所属企业"
                  options={enterpriseOptions}
                  loading={optionsLoading}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择车辆状态' }]}
              >
                <Select
                  options={vehicleStatusOptions}
                  disabled={submitting || (editing && !canChangeStatus)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}

export default VehicleFormModal
