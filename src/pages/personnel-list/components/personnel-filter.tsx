import { Button, Col, Flex, Form, Input, Row, Select, type SelectProps } from 'antd'

import type { PersonnelStatus } from '../../../types/personnel'
import './personnel-filter.scss'

/**
 * 人员列表筛选条件
 */
export interface PersonnelFilterValues {
  /** 姓名关键词 */
  name?: string
  /** 手机号码关键词 */
  phone?: string
  /** 所属企业稳定唯一标识 */
  enterpriseId?: string
  /** 当前任职状态 */
  status?: PersonnelStatus
}

interface PersonnelFilterProps {
  /** 可供筛选的企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 提交或重置筛选条件 */
  onSearch: (values: PersonnelFilterValues) => void
}

const statusOptions = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'resigned' },
  { label: '停用', value: 'suspended' },
]

/**
 * 人员列表筛选表单，负责收集、提交和重置筛选条件
 */
function PersonnelFilter({
  enterpriseOptions,
  onSearch,
}: PersonnelFilterProps) {
  const [form] = Form.useForm<PersonnelFilterValues>()

  /**
   * 清空表单并立即加载全部人员
   */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="personnel-filter-panel" aria-label="人员筛选">
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: '1 1 0' }}
        onFinish={onSearch}
      >
        <Flex vertical gap={16}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="name" label={<span className="personnel-filter-label">姓名</span>}>
                <Input allowClear placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="phone" label={<span className="personnel-filter-label">手机号</span>}>
                <Input allowClear placeholder="请输入手机号" maxLength={11} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="enterpriseId"
                label={<span className="personnel-filter-label">所属企业</span>}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择企业"
                  options={enterpriseOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="status" label={<span className="personnel-filter-label">状态</span>}>
                <Select allowClear placeholder="请选择状态" options={statusOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={16}>
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
        </Flex>
      </Form>
    </section>
  )
}

export default PersonnelFilter
