import { Button, Col, DatePicker, Form, Input, Row, Select, type SelectProps } from 'antd'

import type { VisitorAppointmentStatus } from '@/types/visitor-appointment'

const { RangePicker } = DatePicker

interface DateValue {
  /** 按指定模板格式化日期 */
  format: (template: string) => string
}

interface AppointmentFilterFormValues {
  /** 访客姓名关键词 */
  visitorName?: string
  /** 所属企业稳定唯一标识 */
  enterpriseId?: string
  /** 预约日期范围 */
  dateRange?: [DateValue, DateValue]
  /** 预约状态 */
  status?: VisitorAppointmentStatus
}

/**
 * 预约列表对外使用的筛选条件
 */
export interface AppointmentFilterValues {
  /** 访客姓名关键词 */
  visitorName?: string
  /** 所属企业稳定唯一标识 */
  enterpriseId?: string
  /** 预约日期范围起始日期 */
  startDate?: string
  /** 预约日期范围结束日期 */
  endDate?: string
  /** 预约状态 */
  status?: VisitorAppointmentStatus
}

interface AppointmentFilterProps {
  /** 可供筛选的企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 当前角色是否只能查看所属企业 */
  enterpriseLocked: boolean
  /** 企业用户默认所属企业标识 */
  defaultEnterpriseId?: string
  /** 提交或重置筛选条件 */
  onSearch: (values: AppointmentFilterValues) => void
}

const statusOptions = [
  { label: '待审批', value: 'pending' },
  { label: '待到访', value: 'approved' },
  { label: '已到访', value: 'checked_in' },
  { label: '已离园', value: 'checked_out' },
  { label: '已驳回', value: 'rejected' },
  { label: '已取消', value: 'cancelled' },
  { label: '已过期', value: 'expired' },
]

/**
 * 访客预约筛选表单，负责转换日期范围并提交查询条件
 */
function AppointmentFilter({
  enterpriseOptions,
  enterpriseLocked,
  defaultEnterpriseId,
  onSearch,
}: AppointmentFilterProps) {
  const [form] = Form.useForm<AppointmentFilterFormValues>()

  /**
   * 将表单日期对象转换为接口使用的日期字符串
   */
  function handleFinish(values: AppointmentFilterFormValues) {
    onSearch({
      visitorName: values.visitorName,
      enterpriseId: values.enterpriseId,
      startDate: values.dateRange?.[0].format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1].format('YYYY-MM-DD'),
      status: values.status,
    })
  }

  /**
   * 清空可编辑条件，并保留企业用户的数据范围
   */
  function handleReset() {
    form.resetFields()
    if (enterpriseLocked && defaultEnterpriseId) {
      form.setFieldValue('enterpriseId', defaultEnterpriseId)
      onSearch({ enterpriseId: defaultEnterpriseId })
      return
    }
    onSearch({})
  }

  return (
    <section className="appointment-filter-panel" aria-label="访客预约筛选">
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ flex: 'none' }}
        wrapperCol={{ flex: '1 1 0' }}
        initialValues={{ enterpriseId: defaultEnterpriseId }}
        onFinish={handleFinish}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="visitorName" label={<span className="appointment-filter-label">访客姓名</span>}>
              <Input allowClear placeholder="请输入访客姓名" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="enterpriseId" label={<span className="appointment-filter-label">所属企业</span>}>
              <Select
                allowClear={!enterpriseLocked}
                showSearch
                disabled={enterpriseLocked}
                optionFilterProp="label"
                placeholder="请选择企业"
                options={enterpriseOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="dateRange" label={<span className="appointment-filter-label">预约日期</span>}>
              <RangePicker allowClear className="appointment-filter-range" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="status" label={<span className="appointment-filter-label">预约状态</span>}>
              <Select allowClear placeholder="请选择状态" options={statusOptions} />
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

export default AppointmentFilter
