import { Alert, Button, Descriptions, Drawer, Flex, Grid, Spin, Typography } from 'antd'
import dayjs from 'dayjs'

import type { OperationLogDetailDto } from '@/types/operation-log'
import { operationLogModuleLabels } from '@/utils/operation-log'
import OperationLogResultTag from './operation-log-result'
import './operation-log-detail-drawer.scss'

interface OperationLogDetailDrawerProps {
  /** 是否打开日志详情 */
  open: boolean
  /** 当前日志的完整审计快照 */
  log?: OperationLogDetailDto
  /** 是否正在读取详情 */
  loading: boolean
  /** 详情是否读取失败 */
  loadError: boolean
  /** 重试详情请求 */
  onRetry: () => void
  /** 关闭详情并取消当前记录高亮 */
  onClose: () => void
}

/** 展示日志基本信息、请求信息和失败原因，内容独立滚动 */
function OperationLogDetailDrawer({
  open,
  log,
  loading,
  loadError,
  onRetry,
  onClose,
}: OperationLogDetailDrawerProps) {
  const screens = Grid.useBreakpoint()
  const paramsText = log?.requestParams ? JSON.stringify(log.requestParams, null, 2) : undefined

  return (
    <Drawer
      className="operation-log-detail-drawer"
      open={open}
      title="日志详情"
      size={screens.sm ? 420 : '100%'}
      mask={!screens.sm}
      destroyOnHidden
      onClose={onClose}
      footer={
        <Flex justify="end">
          <Button onClick={onClose}>关闭</Button>
        </Flex>
      }
    >
      {loading ? (
        <Spin description="正在加载日志详情">
          <div className="operation-log-detail-loading" />
        </Spin>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          title="日志详情加载失败"
          action={
            <Button size="small" onClick={onRetry}>
              重试
            </Button>
          }
        />
      ) : log ? (
        <Flex vertical gap={16}>
          <section className="operation-log-detail-section" aria-label="基本信息">
            <Descriptions
              title="基本信息"
              column={1}
              size="small"
              colon={false}
              items={[
                {
                  key: 'operatedAt',
                  label: '操作时间',
                  children: dayjs(log.operatedAt).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  key: 'operatorName',
                  label: '操作人',
                  children: log.operatorName,
                },
                { key: 'roleName', label: '角色', children: log.roleName },
                { key: 'ipAddress', label: 'IP 地址', children: log.ipAddress },
                {
                  key: 'result',
                  label: '操作结果',
                  children: <OperationLogResultTag result={log.result} />,
                },
              ]}
            />
          </section>
          <section className="operation-log-detail-section" aria-label="操作信息">
            <Descriptions
              title="操作信息"
              column={1}
              size="small"
              colon={false}
              items={[
                {
                  key: 'module',
                  label: '模块',
                  children: operationLogModuleLabels[log.module],
                },
                { key: 'action', label: '操作动作', children: log.action },
                {
                  key: 'objectName',
                  label: '操作对象',
                  children: log.objectName ?? '—',
                },
                {
                  key: 'objectId',
                  label: '对象 ID',
                  children: log.objectId ?? '—',
                },
                {
                  key: 'requestMethod',
                  label: '请求方式',
                  children: log.requestMethod,
                },
                {
                  key: 'requestUrl',
                  label: '请求地址',
                  children: log.requestUrl,
                },
                {
                  key: 'description',
                  label: '操作描述',
                  children: log.description,
                },
              ]}
            />
          </section>
          <section className="operation-log-detail-section" aria-label="请求参数与诊断">
            <Flex vertical gap={14}>
              {log.result === 'failure' ? (
                <>
                  <h3 className="operation-log-detail-title">失败原因</h3>
                  <Alert
                    type="error"
                    showIcon
                    title="操作失败"
                    description={log.failureReason ?? '未记录具体失败原因'}
                  />
                </>
              ) : null}
              <h3 className="operation-log-detail-title">请求参数</h3>
              {paramsText ? (
                <Typography.Paragraph
                  className="operation-log-request-params"
                  copyable={{
                    text: paramsText,
                    tooltips: ['复制请求参数', '已复制'],
                  }}
                >
                  <pre>{paramsText}</pre>
                </Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">无请求参数</Typography.Text>
              )}
            </Flex>
          </section>
        </Flex>
      ) : null}
    </Drawer>
  )
}

export default OperationLogDetailDrawer
