import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd'
import type { Dayjs } from 'dayjs'

import type {
  OperationLogListParams,
  OperationLogModule,
  OperationLogResult,
} from '@/types/operation-log'
import { operationLogModuleLabels, operationLogResultLabels } from '@/utils/operation-log'
import './operation-log-filter.scss'

/** 提交给页面的日志筛选条件，分页由页面独立管理 */
export type OperationLogFilterValues = Omit<OperationLogListParams, 'page' | 'pageSize'>

interface OperationLogFilterFormValues {
  /** 操作人姓名关键词 */
  operatorName?: string
  /** 业务模块 */
  module?: OperationLogModule
  /** 本地操作时间范围 */
  timeRange?: [Dayjs, Dayjs]
  /** 操作结果 */
  result?: OperationLogResult
}

interface OperationLogFilterProps {
  /** 提交筛选或立即重置查询 */
  onSearch: (values: OperationLogFilterValues) => void
}

const moduleOptions = Object.entries(operationLogModuleLabels).map(([value, label]) => ({ value, label }))
const resultOptions = Object.entries(operationLogResultLabels).map(([value, label]) => ({ value, label }))

/** 收集日志查询条件，将本地时间转换为包含整分钟的 UTC 查询边界 */
function OperationLogFilter({ onSearch }: OperationLogFilterProps) {
  const [form] = Form.useForm<OperationLogFilterFormValues>()

  /** 归一化关键词和时间范围后提交 */
  function handleFinish(values: OperationLogFilterFormValues) {
    onSearch({
      operatorName: values.operatorName?.trim() || undefined,
      module: values.module,
      result: values.result,
      startTime: values.timeRange?.[0].startOf('minute').toISOString(),
      endTime: values.timeRange?.[1].endOf('minute').toISOString(),
    })
  }

  /** 清空控件后立即恢复全部日志 */
  function handleReset() {
    form.resetFields()
    onSearch({})
  }

  return (
    <section className="operation-log-filter-panel" aria-label="操作日志筛选">
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
              name="operatorName"
              label={<span className="operation-log-filter-label">操作人</span>}
            >
              <Input allowClear placeholder="请输入操作人姓名" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="module"
              label={<span className="operation-log-filter-label">模块</span>}
            >
              <Select allowClear placeholder="请选择模块" options={moduleOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="timeRange"
              label={<span className="operation-log-filter-label">操作时间</span>}
            >
              <DatePicker.RangePicker
                className="operation-log-filter-range"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              name="result"
              label={<span className="operation-log-filter-label">操作结果</span>}
            >
              <Select allowClear placeholder="请选择结果" options={resultOptions} />
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

export default OperationLogFilter
