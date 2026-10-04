import { SearchOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Flex, Form, Input, Row, Select } from 'antd'

import type { DeviceListParams } from '@/types/device'
import { deviceStatusOptions, deviceTypeOptions } from '@/utils/device'
import './device-filter.scss'

/** 设备筛选条件，分页由页面独立维护 */
export type DeviceFilterValues = Omit<DeviceListParams, 'page' | 'pageSize'>

interface DeviceFilterProps {
  /** 接口返回的已登记位置 */
  locations: string[]
  /** 位置选项是否正在加载 */
  locationsLoading: boolean
  /** 位置选项是否加载失败 */
  locationsError: boolean
  /** 重试位置选项请求 */
  onRetryLocations: () => void
  /** 提交或重置筛选条件 */
  onSearch: (values: DeviceFilterValues) => void
}

/** 设备查询表单，使用统一水平标签及响应式三列布局 */
function DeviceFilter({
  locations,
  locationsLoading,
  locationsError,
  onRetryLocations,
  onSearch,
}: DeviceFilterProps) {
  const [form] = Form.useForm<DeviceFilterValues>()

  /** 清空表单并立即重新查询所有设备 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="device-filter-panel" aria-label="设备筛选">
      <Flex vertical gap={16}>
        {locationsError ? (
          <Alert
            type="warning"
            showIcon
            title="位置选项加载失败"
            action={<Button size="small" onClick={onRetryLocations}>重试</Button>}
          />
        ) : null}
        <Form
          name="device-filter"
          form={form}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ flex: 'none' }}
          wrapperCol={{ flex: '1 1 0' }}
          onFinish={onSearch}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="keyword" label={<span className="device-filter-label">设备名称</span>}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="请输入设备名称或编码"
                  maxLength={60}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="type" label={<span className="device-filter-label">设备类型</span>}>
                <Select allowClear placeholder="请选择设备类型" options={deviceTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="location" label={<span className="device-filter-label">位置</span>}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择位置"
                  loading={locationsLoading}
                  options={locations.map((value) => ({ value, label: value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="status" label={<span className="device-filter-label">状态</span>}>
                <Select allowClear placeholder="请选择状态" options={deviceStatusOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={16}>
              <Row gutter={12} justify="end" wrap={false}>
                <Col><Button type="primary" htmlType="submit">查询</Button></Col>
                <Col><Button onClick={handleReset}>重置</Button></Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Flex>
    </section>
  )
}

export default DeviceFilter
