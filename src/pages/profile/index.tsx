import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Skeleton,
  Tabs,
  Tag,
} from 'antd'

import { useUserStore } from '@/stores/user'
import type { DataScope } from '@/types/auth'
import { formatDateTime } from '@/utils/date-time'
import ProfileInformationForm from './components/profile-information-form'
import ProfilePasswordForm from './components/profile-password-form'
import './profile.scss'

const dataScopeLabels: Record<DataScope, string> = {
  all: '全部园区数据',
  park: '当前园区数据',
  enterprise: '所属企业数据',
}

/** 展示当前登录账号的身份信息，并提供个人资料和密码修改入口 */
function ProfilePage() {
  const currentUser = useUserStore((state) => state.currentUser)
  const loading = useUserStore((state) => state.loading)
  const reqLoadCurrentUser = useUserStore((state) => state.reqLoadCurrentUser)

  if (loading) {
    return <Skeleton active className="profile-loading" paragraph={{ rows: 12 }} />
  }

  if (!currentUser) {
    return (
      <Alert
        type="error"
        showIcon
        title="个人资料加载失败"
        description="请重试以获取当前账号信息"
        action={<Button onClick={() => void reqLoadCurrentUser()}>重试</Button>}
      />
    )
  }

  return (
    <Flex vertical gap={20} className="profile-page">
      <header>
        <h1 className="profile-page-title">个人中心</h1>
        <p className="profile-page-description">查看账号信息，管理个人资料与登录密码</p>
      </header>

      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} xl={8}>
          <Card className="profile-card profile-identity-card">
            <Flex vertical align="center" gap={12} className="profile-identity">
              <Avatar size={72} icon={<UserOutlined />} className="profile-avatar" />
              <h2 className="profile-user-name">{currentUser.name}</h2>
              <span className="profile-username">{currentUser.username}</span>
              <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                {currentUser.role.name}
              </Tag>
            </Flex>

            <Descriptions
              column={1}
              colon={false}
              className="profile-account-details"
              items={[
                {
                  key: 'status',
                  label: '账号状态',
                  children: (
                    <Tag color={currentUser.status === 'active' ? 'success' : 'default'}>
                      {currentUser.status === 'active' ? '正常' : '已停用'}
                    </Tag>
                  ),
                },
                {
                  key: 'scope',
                  label: '数据范围',
                  children: dataScopeLabels[currentUser.role.dataScope],
                },
                ...(currentUser.role.code === 'enterprise_user'
                  ? [
                      {
                        key: 'enterprise',
                        label: '所属企业',
                        children: currentUser.enterprise?.name ?? '未关联企业',
                      },
                    ]
                  : []),
                {
                  key: 'createdAt',
                  label: '创建时间',
                  children: formatDateTime(currentUser.createdAt),
                },
                {
                  key: 'lastLoginAt',
                  label: '最近登录',
                  children: currentUser.lastLoginAt
                    ? formatDateTime(currentUser.lastLoginAt)
                    : '暂无登录记录',
                },
              ]}
            />
            <p className="profile-role-description">{currentUser.role.description}</p>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card className="profile-card profile-settings-card">
            <Tabs
              className="profile-settings-tabs"
              destroyOnHidden
              items={[
                {
                  key: 'information',
                  label: '基本资料',
                  icon: <UserOutlined />,
                  children: <ProfileInformationForm user={currentUser} />,
                },
                {
                  key: 'password',
                  label: '安全设置',
                  icon: <SafetyCertificateOutlined />,
                  children: <ProfilePasswordForm />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Flex>
  )
}

export default ProfilePage
