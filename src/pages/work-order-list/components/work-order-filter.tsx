import { SearchOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, Select, type SelectProps } from 'antd'

import type { WorkOrderListParams } from '@/types/work-order'
import { workOrderStatusLabels, workOrderTypeLabels } from '@/utils/work-order'
import './work-order-filter.scss'

/** 工单查询表单提交的筛选条件 */
export type WorkOrderFilterValues = Omit<WorkOrderListParams, 'page' | 'pageSize'>

interface WorkOrderFilterProps {
  /** 当前账号可见的企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 企业选项是否正在加载 */
  optionsLoading: boolean
  /** 提交查询或立即重置筛选 */
  onSearch: (values: WorkOrderFilterValues) => void
}

/** 工单编号、类型、企业和状态筛选，遵循统一多行栅格布局 */
function WorkOrderFilter({ enterpriseOptions, optionsLoading, onSearch }: WorkOrderFilterProps) {
  const [form] = Form.useForm<WorkOrderFilterValues>()

  /** 去除编号前后空格，保留其他结构化筛选 */
  function handleFinish(values: WorkOrderFilterValues) {
    onSearch({ ...values, code: values.code?.trim() || undefined })
  }

  /** 清空表单并立即恢复当前账号可见工单 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="work-order-filter-panel" aria-label="工单查询">
      <Form
        name="work-order-filter"
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
              name="code"
              label={<span className="work-order-filter-label">工单编号</span>}
            >
              <Input allowClear placeholder="请输入工单编号" suffix={<SearchOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="type"
              label={<span className="work-order-filter-label">工单类型</span>}
            >
              <Select
                allowClear
                placeholder="请选择工单类型"
                options={Object.entries(workOrderTypeLabels).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="enterpriseId"
              label={<span className="work-order-filter-label">所属企业</span>}
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
              label={<span className="work-order-filter-label">工单状态</span>}
            >
              <Select
                allowClear
                placeholder="请选择状态"
                options={Object.entries(workOrderStatusLabels).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={16}>
            <Row gutter={12} justify="end" wrap={false}>
              <Col>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
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

export default WorkOrderFilter
