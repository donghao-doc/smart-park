import { Alert, Button, Card, Flex } from 'antd'
import type { MockExceptionSetting } from '@/types/mock-data'
import MockExceptionTable from './mock-exception-table'
import './mock-exception-card.scss'

/** 异常模拟卡片的配置、操作状态和页面回调 */
interface MockExceptionCardProps {
  /** 尚未提交的各模块异常设置 */
  settings: MockExceptionSetting[]
  /** 保存、重置或无管理权限时禁用操作 */
  disabled: boolean
  /** 是否正在保存整页 Mock 设置 */
  saving: boolean
  /** 延迟或异常配置是否存在尚未保存的修改 */
  hasChanges: boolean
  /** 更新指定模块的配置草稿 */
  onChange: (setting: MockExceptionSetting) => void
  /** 请求页面保存全部配置草稿 */
  onSave: () => void
  /** 请求页面打开恢复初始数据的二次确认弹窗 */
  onReset: () => void
}

/** 展示异常模拟配置、本地生效说明及保存和恢复操作 */
function MockExceptionCard({
  settings,
  disabled,
  saving,
  hasChanges,
  onChange,
  onSave,
  onReset,
}: MockExceptionCardProps) {
  return (
    <Card className="mock-exception-card">
      <h2 className="mock-exception-card-title">异常模拟</h2>
      <p className="mock-exception-card-description">
        按接口模块设置异常状态码，用于模拟接口异常场景
      </p>
      <MockExceptionTable settings={settings} disabled={disabled} onChange={onChange} />
      <p className="mock-exception-login-note">
        Login 异常仅作用于登录接口，当前用户与菜单接口保持可用
      </p>
      <Alert
        className="mock-exception-browser-notice"
        type="warning"
        showIcon
        title="当前浏览器"
        description="所有 Mock 配置仅在当前浏览器内生效，不会影响其他用户或生产环境。刷新页面后仍会保留已保存的设置。"
      />
      <Flex align="center" justify="space-between" gap={16} wrap="wrap">
        <Flex align="center" gap={16} wrap="wrap">
          <Button danger disabled={disabled} onClick={onReset}>
            恢复初始数据
          </Button>
          <span className="mock-exception-reset-note">
            清除业务修改及配置并退出登录，此操作不可撤销
          </span>
        </Flex>
        <Flex align="center" gap={12}>
          {hasChanges && <span className="mock-exception-unsaved">有未保存的设置</span>}
          <Button
            type="primary"
            loading={saving}
            disabled={disabled || !hasChanges}
            onClick={onSave}
          >
            保存设置
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}

export default MockExceptionCard
