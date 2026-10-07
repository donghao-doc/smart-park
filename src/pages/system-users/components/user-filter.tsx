import { Alert, Button, Col, Form, Input, Row, Select, type SelectProps } from 'antd'
import { useEffect } from 'react'

import type { UserListParams } from '@/types/system-user'
import { userStatusOptions } from '../user-options'
import './user-filter.scss'

/** 用户列表查询表单收集的独立筛选条件 */
export type UserFilterValues = Pick<UserListParams, 'username' | 'name' | 'roleCode' | 'status'>

interface UserFilterProps {
  /** 角色管理跳转时使用的初始角色筛选 */
  initialRoleCode?: string
  /** 最新角色选项，包含自定义角色 */
  roleOptions: SelectProps['options']
  /** 角色选项加载是否失败 */
  rolesError: boolean
  /** 重新加载角色选项 */
  onRetryRoles: () => void
  /** 提交查询或清空条件后重新加载列表 */
  onSearch: (values: UserFilterValues) => void
}

/** 用户管理筛选表单，支持多个条件组合查询与立即重置 */
function UserFilter({
  onSearch,
  initialRoleCode,
  roleOptions,
  rolesError,
  onRetryRoles,
}: UserFilterProps) {
  const [form] = Form.useForm<UserFilterValues>()

  useEffect(() => {
    form.resetFields()
    form.setFieldValue('roleCode', initialRoleCode)
  }, [form, initialRoleCode])

  /** 清空控件并恢复全部用户 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="user-filter-panel" aria-label="用户筛选">
      {rolesError ? (
        <Alert
          className="user-filter-feedback"
          type="error"
          showIcon
          title="角色选项加载失败"
          action={
            <Button size="small" onClick={onRetryRoles}>
              重试
            </Button>
          }
        />
      ) : null}
      <Form
        name="user-filter"
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: '1 1 0' }}
        onFinish={onSearch}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            {rolesError ? (
              <Alert
                className="user-filter-feedback"
                type="error"
                showIcon
                title="角色选项加载失败"
                action={
                  <Button size="small" onClick={onRetryRoles}>
                    重试
                  </Button>
                }
              />
            ) : null}
            <Form.Item name="username" label={<span className="user-filter-label">用户名</span>}>
              <Input allowClear placeholder="请输入用户名" maxLength={32} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            {rolesError ? (
              <Alert
                className="user-filter-feedback"
                type="error"
                showIcon
                title="角色选项加载失败"
                action={
                  <Button size="small" onClick={onRetryRoles}>
                    重试
                  </Button>
                }
              />
            ) : null}
            <Form.Item name="name" label={<span className="user-filter-label">姓名</span>}>
              <Input allowClear placeholder="请输入姓名" maxLength={30} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            {rolesError ? (
              <Alert
                className="user-filter-feedback"
                type="error"
                showIcon
                title="角色选项加载失败"
                action={
                  <Button size="small" onClick={onRetryRoles}>
                    重试
                  </Button>
                }
              />
            ) : null}
            <Form.Item name="roleCode" label={<span className="user-filter-label">角色</span>}>
              <Select allowClear placeholder="请选择角色" options={roleOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            {rolesError ? (
              <Alert
                className="user-filter-feedback"
                type="error"
                showIcon
                title="角色选项加载失败"
                action={
                  <Button size="small" onClick={onRetryRoles}>
                    重试
                  </Button>
                }
              />
            ) : null}
            <Form.Item name="status" label={<span className="user-filter-label">状态</span>}>
              <Select allowClear placeholder="请选择状态" options={userStatusOptions} />
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

export default UserFilter
