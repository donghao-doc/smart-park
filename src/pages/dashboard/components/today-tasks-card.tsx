import { RightOutlined } from '@ant-design/icons'
import { Alert, Button, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'

import type {
  DashboardTaskDto,
  DashboardTaskPriority,
} from '@/types/dashboard'
import './today-tasks-card.scss'

const taskPriorityPresentation: Record<
  DashboardTaskPriority,
  { label: string; className: string }
> = {
  high: { label: '高', className: 'is-high' },
  medium: { label: '中', className: 'is-medium' },
  low: { label: '低', className: 'is-low' },
}

/**
 * Dashboard 今日待办卡片属性
 */
export interface TodayTasksCardProps {
  /** 今日待办任务列表 */
  tasks: DashboardTaskDto[]
  /** 任务列表是否处于加载状态 */
  loading: boolean
  /** 任务列表是否加载失败 */
  error: boolean
  /** 点击查看更多时触发 */
  onViewMore: () => void
  /** 点击任务处理入口时触发 */
  onProcessTask: (task: DashboardTaskDto) => void
}

/**
 * 将待办创建时间格式化为月日与时分
 */
function formatTaskTime(value: string) {
  const [date, time] = value.split('T')
  return `${date.slice(5)}  ${time.slice(0, 5)}`
}

/**
 * 展示今日待办任务及对应处理入口
 */
function TodayTasksCard({
  tasks,
  loading,
  error,
  onViewMore,
  onProcessTask,
}: TodayTasksCardProps) {
  const columns: TableColumnsType<DashboardTaskDto> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 46,
      render: (_value, _task, index) => index + 1,
    },
    { title: '任务标题', dataIndex: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'category', width: 114 },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 96,
      render: (priority: DashboardTaskPriority) => {
        const presentation = taskPriorityPresentation[priority]
        return (
          <Tag className={`today-tasks-card-priority ${presentation.className}`}>
            {presentation.label}
          </Tag>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 146,
      render: (value: string) => formatTaskTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 82,
      render: (_value, task) => (
        <Button
          type="link"
          className="today-tasks-card-action"
          onClick={() => onProcessTask(task)}
        >
          去处理
        </Button>
      ),
    },
  ]

  return (
    <article className="dashboard-panel today-tasks-card">
      <div className="dashboard-panel-heading">
        <h2>今日待办任务</h2>
        <Button type="link" className="dashboard-view-more" onClick={onViewMore}>
          查看更多 <RightOutlined />
        </Button>
      </div>

      {error ? (
        <Alert type="error" showIcon message="今日待办加载失败" />
      ) : (
        <Table<DashboardTaskDto>
          className="today-tasks-card-table"
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 680 }}
        />
      )}
    </article>
  )
}

export default TodayTasksCard
