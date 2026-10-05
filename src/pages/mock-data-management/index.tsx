import { Alert, App, Button, Card, Flex, Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { reqGetMockData, reqResetMockData, reqUpdateMockSettings } from '@/api'
import ScrollableModal from '@/components/scrollable-modal'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import type { MockDataDto, MockExceptionSetting, MockSettings } from '@/types/mock-data'
import MockDataSummary from './components/mock-data-summary'
import MockDelayCard from './components/mock-delay-card'
import MockExceptionTable from './components/mock-exception-table'
import './mock-data-management.scss'

/** Mock 数据管理页面，通过接口维护浏览器内的模拟环境 */
function MockDataManagementPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const canManage = useUserStore((state) => state.hasPermission('mock-data:manage'))
  const [data, setData] = useState<MockDataDto>()
  const [draft, setDraft] = useState<MockSettings>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await reqGetMockData()
        if (active) {
          setData(result)
          setDraft({ responseDelay: result.responseDelay, exceptions: result.exceptions })
          setLoadError(false)
        }
      } catch {
        if (active) setLoadError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [reloadVersion])

  const disabled = saving || resetting || !canManage
  const hasChanges = Boolean(
    data &&
    draft &&
    (data.responseDelay !== draft.responseDelay ||
      JSON.stringify(data.exceptions) !== JSON.stringify(draft.exceptions)),
  )

  /** 接收卡片校验后的延迟值并更新配置草稿 */
  function handleDelayChange(responseDelay: number) {
    setDraft((current) => (current ? { ...current, responseDelay } : current))
  }

  /** 更新模块配置草稿，保存前不影响实际接口 */
  function handleExceptionChange(setting: MockExceptionSetting) {
    setDraft((current) =>
      current
        ? {
            ...current,
            exceptions: current.exceptions.map((item) =>
              item.module === setting.module ? setting : item,
            ),
          }
        : current,
    )
  }

  /** 保存配置并使用接口返回值更新本地草稿 */
  async function handleSave() {
    if (!draft || disabled || !hasChanges) return
    setSaving(true)
    try {
      const result = await reqUpdateMockSettings(draft)
      setData(result)
      setDraft({ responseDelay: result.responseDelay, exceptions: result.exceptions })
      void message.success('Mock 设置已保存，将应用于后续请求')
    } catch {
      // 统一 HTTP 层展示错误，保留草稿供用户重试
    } finally {
      setSaving(false)
    }
  }

  /** 二次确认后恢复种子数据，清理前端会话并返回登录页 */
  async function handleReset() {
    if (disabled) return
    setResetting(true)
    try {
      await reqResetMockData()
      setResetOpen(false)
      useMenuStore.getState().resetMenus()
      useUserStore.getState().resetUser()
      useAuthStore.getState().clearSession()
      void message.success('已恢复初始数据，请重新登录')
      await navigate('/login', { replace: true })
    } catch {
      // 保持确认框打开以便重试，错误提示由统一 HTTP 层负责
    } finally {
      setResetting(false)
    }
  }

  return (
    <Flex vertical gap={16} className="mock-data-page">
      {loading ? (
        <Card className="mock-data-panel">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      ) : loadError || !data || !draft ? (
        <Alert
          type="error"
          showIcon
          title="Mock 配置加载失败"
          description="请重试加载当前浏览器的配置"
          action={
            <Button
              onClick={() => {
                setLoading(true)
                setReloadVersion((version) => version + 1)
              }}
            >
              重试
            </Button>
          }
        />
      ) : (
        <>
          <MockDataSummary data={data} />

          <MockDelayCard
            value={draft.responseDelay}
            disabled={disabled}
            onChange={handleDelayChange}
          />

          <Card className="mock-data-panel">
            <h2 className="mock-data-section-title">异常模拟</h2>
            <p className="mock-data-section-description">
              按接口模块设置异常状态码，用于模拟接口异常场景
            </p>
            <MockExceptionTable
              settings={draft.exceptions}
              disabled={disabled}
              onChange={handleExceptionChange}
            />
            <p className="mock-data-login-note">
              Login 异常仅作用于登录接口，当前用户与菜单接口保持可用
            </p>
            <Alert
              className="mock-data-browser-notice"
              type="warning"
              showIcon
              title="当前浏览器"
              description="所有 Mock 配置仅在当前浏览器内生效，不会影响其他用户或生产环境。刷新页面后仍会保留已保存的设置。"
            />
            <Flex align="center" justify="space-between" gap={16} wrap="wrap">
              <Flex align="center" gap={16} wrap="wrap">
                <Button danger disabled={disabled} onClick={() => setResetOpen(true)}>
                  恢复初始数据
                </Button>
                <span className="mock-data-reset-note">
                  清除业务修改及配置并退出登录，此操作不可撤销
                </span>
              </Flex>
              <Flex align="center" gap={12}>
                {hasChanges && <span className="mock-data-unsaved">有未保存的设置</span>}
                <Button
                  type="primary"
                  loading={saving}
                  disabled={disabled || !hasChanges}
                  onClick={() => void handleSave()}
                >
                  保存设置
                </Button>
              </Flex>
            </Flex>
          </Card>
        </>
      )}
      <ScrollableModal
        open={resetOpen}
        title="确认恢复初始数据？"
        width={520}
        okText="确认恢复"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ disabled: resetting }}
        confirmLoading={resetting}
        closable={!resetting}
        keyboard={!resetting}
        mask={{ closable: false }}
        onOk={() => void handleReset()}
        onCancel={() => setResetOpen(false)}
      >
        <Alert
          type="warning"
          showIcon
          title="此操作不可撤销"
          description="将清除当前浏览器中的业务修改和所有 Mock 配置，恢复标准种子数据，并退出登录。"
        />
      </ScrollableModal>
    </Flex>
  )
}

export default MockDataManagementPage
