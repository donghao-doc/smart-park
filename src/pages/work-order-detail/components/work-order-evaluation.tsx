import { Alert, Button, Col, Form, Input, Rate, Row } from 'antd'

import type { WorkOrderDto } from '@/types/work-order'
import { getWorkOrderResult } from '../utils'

interface WorkOrderEvaluationProps {
  /** 当前工单及确认结果 */
  order: WorkOrderDto
  /** 是否允许当前账号确认工单 */
  canConfirm: boolean
  /** 是否正在执行工单操作或上传图片 */
  busy: boolean
  /** 确认完成，可附带评分和文字反馈 */
  onConfirm: (rating?: number, feedback?: string) => void
}

interface EvaluationValues {
  /** 1～5 分服务评价 */
  rating?: number
  /** 企业联系人填写的反馈 */
  feedback?: string
}

const ratingLabels = ['非常不满意', '不满意', '一般', '满意', '非常满意']

/** 展示本轮处理结果，允许企业确认完成或提交评价，归档后展示确认结果 */
function WorkOrderEvaluation({ order, canConfirm, busy, onConfirm }: WorkOrderEvaluationProps) {
  const [form] = Form.useForm<EvaluationValues>()
  const result = getWorkOrderResult(order)

  /** 无评分也可直接确认，但仍校验反馈长度 */
  async function handleConfirm() {
    try {
      const values = await form.validateFields(['feedback'])
      onConfirm(form.getFieldValue('rating') || undefined, values.feedback)
    } catch {
      // 表单在对应字段展示校验信息，不发送无效反馈
    }
  }

  return (
    <>
      <h3 className="work-order-detail-subheading">处理结果</h3>
      <p className="work-order-detail-result">{result ?? '尚未提交处理结果'}</p>
      {order.status === 'completed' ? (
        <>
          <h3 className="work-order-detail-subheading">服务评价</h3>
          {order.rating ? (
            <Rate disabled value={order.rating} tooltips={ratingLabels} />
          ) : <p className="work-order-detail-secondary">企业已确认完成，未评分</p>}
          <p className="work-order-detail-description">{order.feedback || '暂无文字反馈'}</p>
          <Alert type="success" showIcon title="企业已确认处理结果，工单已完成" />
        </>
      ) : canConfirm ? (
        <Form
          form={form}
          layout="vertical"
          disabled={busy}
          onFinish={(values: EvaluationValues) => onConfirm(values.rating, values.feedback)}
        >
          <Form.Item
            name="rating"
            label="请对本次服务进行评价"
            rules={[{
              type: 'number',
              min: 1,
              max: 5,
              required: true,
              message: '请先选择 1～5 分的服务评价',
            }]}
          >
            <Rate className="work-order-detail-rating" tooltips={ratingLabels} aria-label="服务评价，1 至 5 分" />
          </Form.Item>
          <Form.Item name="feedback" label="评价反馈（可选）" rules={[{ max: 1000 }]}>
            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="请填写服务体验或改进建议" />
          </Form.Item>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <Button type="primary" block loading={busy} onClick={() => void handleConfirm()}>
                确认完成
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button block htmlType="submit" disabled={busy}>提交评价</Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <p className="work-order-detail-secondary">
          {order.status === 'pending_confirmation'
            ? '等待企业联系人确认处理结果，处理人不能确认自己处理的工单'
            : order.status === 'cancelled' ? '工单已取消，重新打开并处理后可确认评价' : '处理结果提交后，企业联系人可确认并评价服务'}
        </p>
      )}
    </>
  )
}

export default WorkOrderEvaluation
