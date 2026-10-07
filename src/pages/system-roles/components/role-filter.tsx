import { Button, Col, Form, Input, Row } from 'antd'

import type { RoleListParams } from '@/types/system-role'
import './role-filter.scss'

/** 角色筛选表单提交的条件 */
export type RoleFilterValues = Pick<RoleListParams, 'keyword'>

interface RoleFilterProps {
  /** 提交查询或清空条件后重新加载角色列表 */
  onSearch: (values: RoleFilterValues) => void
}

/** 角色管理筛选表单，按名称或编码查询 */
export default function RoleFilter({ onSearch }: RoleFilterProps) {
  const [form] = Form.useForm<RoleFilterValues>()

  return (
    <section className="role-filter-panel" aria-label="角色筛选">
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
            <Form.Item name="keyword" label={<span className="role-filter-label">角色信息</span>}>
              <Input allowClear placeholder="请输入角色名称或编码" maxLength={32} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={16}>
            <Row gutter={12} justify="end" wrap={false}>
              <Col>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
              </Col>
              <Col>
                <Button
                  onClick={() => {
                    form.resetFields()
                    onSearch({})
                  }}
                >
                  重置
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </section>
  )
}
