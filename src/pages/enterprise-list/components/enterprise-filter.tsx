import { Button, Col, Form, Input, Row, Select } from 'antd'

import type { EnterpriseStatus } from '@/types/enterprise'
import './enterprise-filter.scss'

/**
 * 企业列表筛选条件
 */
export interface EnterpriseFilterValues {
  /** 企业名称搜索词 */
  keyword?: string
  /** 企业当前入驻状态 */
  status?: EnterpriseStatus
}

interface EnterpriseFilterProps {
  /** 提交或重置筛选条件 */
  onSearch: (values: EnterpriseFilterValues) => void
}

const statusOptions = [
  { label: '已入驻', value: 'active' },
  { label: '已停用', value: 'disabled' },
]

/**
 * 企业列表筛选表单，负责收集、提交和重置筛选条件
 */
function EnterpriseFilter({ onSearch }: EnterpriseFilterProps) {
  const [form] = Form.useForm<EnterpriseFilterValues>()

  /**
   * 清空表单并立即加载全部企业
   */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="enterprise-filter-panel" aria-label="企业筛选">
      <Form
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
              name="keyword"
              label={<span className="enterprise-filter-label">企业名称</span>}
            >
              <Input allowClear placeholder="请输入企业名称" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="status"
              label={<span className="enterprise-filter-label">状态</span>}
            >
              <Select allowClear placeholder="请选择状态" options={statusOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
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

export default EnterpriseFilter
