import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd'
import type { Dayjs } from 'dayjs'

import type {
  ParkingRecordListParams,
  ParkingRecordStatus,
  ParkingVehicleType,
} from '@/types/parking-record'
import { normalizeVehiclePlate } from '@/utils/vehicle'
import { parkingStatusOptions, parkingVehicleTypeOptions } from '../parking-options'
import './parking-filter.scss'

/** 停车筛选表单提交给页面的接口查询条件 */
export type ParkingFilterValues = Omit<ParkingRecordListParams, 'page' | 'pageSize'>

interface ParkingFilterFormValues {
  /** 车牌关键词 */
  plateNumber?: string
  /** 通行车型 */
  vehicleType?: ParkingVehicleType
  /** 按入场时间查询的本地日期时间范围 */
  timeRange?: [Dayjs, Dayjs]
  /** 停车通行状态 */
  status?: ParkingRecordStatus
}

interface ParkingFilterProps {
  /** 提交或重置查询条件 */
  onSearch: (values: ParkingFilterValues) => void
}

/** 停车记录筛选表单，统一归一化车牌和日期时间查询边界 */
function ParkingFilter({ onSearch }: ParkingFilterProps) {
  const [form] = Form.useForm<ParkingFilterFormValues>()

  /** 将分钟精度的表单时间转换为包含整分钟边界的 ISO 时间 */
  function handleFinish(values: ParkingFilterFormValues) {
    onSearch({
      plateNumber: normalizeVehiclePlate(values.plateNumber ?? '') || undefined,
      vehicleType: values.vehicleType,
      startTime: values.timeRange?.[0].startOf('minute').toISOString(),
      endTime: values.timeRange?.[1].endOf('minute').toISOString(),
      status: values.status,
    })
  }

  /** 清空筛选并立即恢复全部可见记录 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="parking-filter-panel" aria-label="停车记录筛选">
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: '1 1 0' }}
        onFinish={handleFinish}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="plateNumber"
              label={<span className="parking-filter-label">车牌号</span>}
            >
              <Input allowClear placeholder="请输入车牌号" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="vehicleType"
              label={<span className="parking-filter-label">车辆类型</span>}
            >
              <Select
                allowClear
                placeholder="请选择车辆类型"
                options={parkingVehicleTypeOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="timeRange"
              label={<span className="parking-filter-label">进出时间</span>}
              tooltip="按入场时间查询；无权限记录按入口识别时间查询"
            >
              <DatePicker.RangePicker
                className="parking-filter-range"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="status"
              label={<span className="parking-filter-label">停车状态</span>}
            >
              <Select allowClear placeholder="请选择停车状态" options={parkingStatusOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={16}>
            <Row gutter={12} justify="end" wrap={false}>
              <Col>
                <Button type="primary" htmlType="submit">查询</Button>
              </Col>
              <Col>
                <Button onClick={handleReset}>重置</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </section>
  )
}

export default ParkingFilter
