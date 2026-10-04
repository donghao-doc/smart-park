import { Alert, Button, Col, Flex, Form, Input, Row, Select, type SelectProps } from 'antd'

import type { VehicleListParams } from '@/types/vehicle'
import { vehicleStatusOptions, vehicleTypeOptions } from '../vehicle-options'
import './vehicle-filter.scss'

/** 车辆列表表单提交的业务筛选条件，不包含分页参数 */
export type VehicleFilterValues = Omit<VehicleListParams, 'page' | 'pageSize'>

interface VehicleFilterProps {
  /** 当前账号可选择的企业 */
  enterpriseOptions: SelectProps['options']
  /** 企业选项是否正在加载 */
  optionsLoading: boolean
  /** 企业选项是否加载失败 */
  optionsError: boolean
  /** 重新加载企业选项 */
  onRetryOptions: () => void
  /** 提交或重置筛选条件 */
  onSearch: (values: VehicleFilterValues) => void
}

/** 车辆档案筛选表单，统一水平标签、响应式栅格和重置查询 */
function VehicleFilter({
  enterpriseOptions,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onSearch,
}: VehicleFilterProps) {
  const [form] = Form.useForm<VehicleFilterValues>()

  /** 重置表单并立即恢复未筛选的列表 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="vehicle-filter-panel" aria-label="车辆筛选">
      <Flex vertical gap={16}>
        {optionsError ? (
          <Alert
            type="warning"
            showIcon
            title="所属企业选项加载失败"
            action={<Button size="small" onClick={onRetryOptions}>重试</Button>}
          />
        ) : null}
        <Form
          name="vehicle-filter"
          form={form}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ flex: 'none' }}
          wrapperCol={{ flex: '1 1 0' }}
          onFinish={onSearch}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="plateNumber"
                label={<span className="vehicle-filter-label">车牌号</span>}
              >
                <Input allowClear placeholder="请输入车牌号" maxLength={20} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="type"
                label={<span className="vehicle-filter-label">车辆类型</span>}
              >
                <Select allowClear placeholder="请选择车辆类型" options={vehicleTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="enterpriseId"
                label={<span className="vehicle-filter-label">所属企业</span>}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择所属企业"
                  options={enterpriseOptions}
                  loading={optionsLoading}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="status"
                label={<span className="vehicle-filter-label">状态</span>}
              >
                <Select allowClear placeholder="请选择状态" options={vehicleStatusOptions} />
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
      </Flex>
    </section>
  )
}

export default VehicleFilter
