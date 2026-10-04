import { Flex, Select, Switch, Table, type TableColumnsType } from 'antd'
import type { MockExceptionSetting } from '@/types/mock-data'
import { mockErrorStatuses, mockModuleOptions } from '@/utils/mock-data'
import './mock-exception-table.scss'

interface MockExceptionTableProps {
  /** 尚未提交的各模块异常设置 */
  settings: MockExceptionSetting[]
  /** 保存或重置过程中禁止修改配置 */
  disabled: boolean
  /** 修改指定模块的开关或状态码 */
  onChange: (setting: MockExceptionSetting) => void
}

/** 按模块启停异常模拟，仅启用的模块可以选择状态码 */
function MockExceptionTable({ settings, disabled, onChange }: MockExceptionTableProps) {
  const columns: TableColumnsType<MockExceptionSetting> = [
    {
      title: '接口模块',
      key: 'module',
      render: (_value, setting) => {
        const option = mockModuleOptions.find((item) => item.value === setting.module)!
        return (
          <Flex gap={16} align="center" wrap="wrap" className="mock-exception-module">
            <span className="mock-exception-name">{option.label}</span>
            <span className="mock-exception-description">{option.description}</span>
          </Flex>
        )
      },
    },
    {
      title: '异常状态码',
      key: 'exception',
      width: 300,
      render: (_value, setting) => {
        const label = mockModuleOptions.find((item) => item.value === setting.module)!.label
        return (
          <Flex align="center" gap={40}>
            <Switch
              checked={setting.enabled}
              disabled={disabled}
              aria-label={`${label} 异常模拟`}
              onChange={(enabled) => onChange({ ...setting, enabled })}
            />
            <Select
              className="mock-exception-status"
              value={setting.statusCode}
              disabled={disabled || !setting.enabled}
              aria-label={`${label} 异常状态码`}
              options={mockErrorStatuses.map((value) => ({ label: String(value), value }))}
              onChange={(statusCode) => onChange({ ...setting, statusCode })}
            />
          </Flex>
        )
      },
    },
  ]

  return (
    <Table<MockExceptionSetting>
      className="mock-exception-table"
      rowKey="module"
      size="small"
      columns={columns}
      dataSource={settings}
      pagination={false}
      scroll={{ x: 620 }}
    />
  )
}

export default MockExceptionTable
