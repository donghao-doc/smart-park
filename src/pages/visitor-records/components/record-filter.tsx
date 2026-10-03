import { Button, Col, DatePicker, Form, Input, Row, Select, type SelectProps } from 'antd'
import type { Dayjs } from 'dayjs'

import type { VisitorRecordListParams, VisitorRecordStatus } from '@/types/visitor-record'
import './record-filter.scss'

/** 到访记录表单提交给页面的查询条件 */
export type RecordFilterValues = Omit<VisitorRecordListParams, 'page' | 'pageSize'>

interface RecordFilterFormValues {
  /** 访客姓名关键词 */
  visitorName?: string
  /** 所属企业标识 */
  enterpriseId?: string
  /** 到访日期范围 */
  dateRange?: [Dayjs, Dayjs]
  /** 历史到访状态 */
  status?: VisitorRecordStatus
}

interface RecordFilterProps {
  /** 当前账号可见的企业选项 */
  enterpriseOptions: SelectProps['options']
  /** 是否固定企业用户的数据范围 */
  enterpriseLocked: boolean
  /** 企业用户所属企业标识 */
  defaultEnterpriseId?: string
  /** 提交或清空筛选条件 */
  onSearch: (values: RecordFilterValues) => void
}

/** 到访记录筛选表单，将日期范围转换为接口日期字符串 */
function RecordFilter({ enterpriseOptions, enterpriseLocked, defaultEnterpriseId, onSearch }: RecordFilterProps) {
  const [form] = Form.useForm<RecordFilterFormValues>()

  /** 提交表单查询条件 */
  function handleFinish(values: RecordFilterFormValues) {
    onSearch({
      visitorName: values.visitorName?.trim() || undefined,
      enterpriseId: enterpriseLocked ? defaultEnterpriseId : values.enterpriseId,
      startDate: values.dateRange?.[0].format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1].format('YYYY-MM-DD'),
      status: values.status,
    })
  }

  /** 清空表单并立即恢复未筛选列表，企业用户仍保留所属企业范围 */
  function handleReset() {
    form.resetFields()
    onSearch(enterpriseLocked ? { enterpriseId: defaultEnterpriseId } : {})
  }

  return (
    <section className="record-filter-panel" aria-label="到访记录筛选">
      <Form form={form} layout="horizontal" labelAlign="left" labelCol={{ flex: 'none' }} wrapperCol={{ flex: '1 1 0' }}
        initialValues={{ enterpriseId: enterpriseLocked ? defaultEnterpriseId : undefined }} onFinish={handleFinish}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="visitorName" label={<span className="record-filter-label">访客姓名</span>}>
              <Input allowClear placeholder="请输入访客姓名" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="enterpriseId" label={<span className="record-filter-label">所属企业</span>}>
              <Select allowClear={!enterpriseLocked} disabled={enterpriseLocked} showSearch optionFilterProp="label"
                placeholder="请选择所属企业" options={enterpriseOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="dateRange" label={<span className="record-filter-label">到访日期</span>}
              tooltip="按签到日期查询，已过期记录按预约日期查询">
              <DatePicker.RangePicker className="record-filter-range" placeholder={['开始日期', '结束日期']} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item name="status" label={<span className="record-filter-label">到访状态</span>}>
              <Select allowClear placeholder="请选择状态" options={[
                { label: '已到访', value: 'checked_in' }, { label: '已离园', value: 'checked_out' }, { label: '已过期', value: 'expired' },
              ]} />
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
    </section>
  )
}

export default RecordFilter
