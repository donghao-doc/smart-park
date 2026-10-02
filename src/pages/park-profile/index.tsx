import {
  ApartmentOutlined,
  BarChartOutlined,
  BankFilled,
  BlockOutlined,
  BorderOutlined,
  DesktopOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PhoneOutlined,
  ProfileOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { TableColumnsType, TreeDataNode } from 'antd'
import {
  Alert,
  App,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Table,
  Tag,
  Tree,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'

import { reqGetCurrentUser } from '../../api/auth'
import {
  reqGetParkProfile,
  reqGetParkSpaces,
  reqUpdateParkProfile,
} from '../../api/park-profile'
import type {
  ParkProfileDto,
  ParkSpaceDto,
  ParkSpaceStatus,
  UpdateParkInfoRequest,
} from '../../types/park-profile'
import './park-profile.scss'

const PAGE_SIZE = 8
const PARK_TREE_ROOT_KEY = 'park-root'

interface SummaryCardConfig {
  key: keyof ParkProfileDto['summary']
  title: string
  unit: string
  icon: React.ReactNode
  tone: 'blue' | 'green' | 'purple' | 'orange'
}

const summaryCards: SummaryCardConfig[] = [
  {
    key: 'buildingCount',
    title: '楼宇数量',
    unit: '栋',
    icon: <ApartmentOutlined />,
    tone: 'blue',
  },
  {
    key: 'floorCount',
    title: '楼层数量',
    unit: '层',
    icon: <BlockOutlined />,
    tone: 'green',
  },
  {
    key: 'spaceCount',
    title: '办公空间',
    unit: '间',
    icon: <DesktopOutlined />,
    tone: 'purple',
  },
  {
    key: 'usedSpaceCount',
    title: '已使用空间',
    unit: '间',
    icon: <BarChartOutlined />,
    tone: 'orange',
  },
]

const spaceColumns: TableColumnsType<ParkSpaceDto> = [
  {
    title: '#',
    key: 'index',
    width: 56,
    render: (_value, _record, index) => index + 1,
  },
  { title: '空间名称', dataIndex: 'name', width: 120 },
  { title: '所属楼宇', dataIndex: 'buildingName', width: 110 },
  { title: '楼层', dataIndex: 'floorName', width: 90 },
  { title: '空间类型', dataIndex: 'type', width: 120 },
  {
    title: '面积（㎡）',
    dataIndex: 'area',
    width: 130,
    render: (value: number) => value.toLocaleString('zh-CN'),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (status: ParkSpaceStatus) => (
      <Tag className={`park-space-status is-${status}`} variant="filled">
        {status === 'used' ? '已使用' : '空闲'}
      </Tag>
    ),
  },
]

/**
 * 将园区楼宇数据转换为页面空间树节点
 */
function createTreeData(profile: ParkProfileDto): TreeDataNode[] {
  return [
    {
      key: PARK_TREE_ROOT_KEY,
      title: profile.info.name,
      icon: <BankFilled />,
      children: profile.buildings.map((building) => ({
        key: building.id,
        title: `${building.name}（${building.description}）`,
        icon: <ApartmentOutlined />,
        children: building.floors.map((floor) => ({
          key: floor.id,
          title: floor.name,
          icon: <HomeOutlined />,
        })),
      })),
    },
  ]
}

/**
 * 园区档案页面，展示并维护园区基础信息与楼宇空间资源
 */
function ParkProfilePage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<UpdateParkInfoRequest>()
  const [profile, setProfile] = useState<ParkProfileDto>()
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [spaces, setSpaces] = useState<ParkSpaceDto[]>([])
  const [spaceTotal, setSpaceTotal] = useState(0)
  const [spaceLoading, setSpaceLoading] = useState(true)
  const [spaceError, setSpaceError] = useState(false)
  const [page, setPage] = useState(1)
  const [buildingId, setBuildingId] = useState<string>()
  const [treeLocationId, setTreeLocationId] = useState<string>()
  const [status, setStatus] = useState<ParkSpaceStatus>()
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<ParkSpaceDto>()

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const [profileData, currentUser] = await Promise.all([
          reqGetParkProfile(),
          reqGetCurrentUser(),
        ])
        if (active) {
          setProfile(profileData)
          setCanEdit(currentUser.role.permissions.includes('park:update'))
          setProfileError(false)
        }
      } catch {
        if (active) {
          setProfileError(true)
        }
      } finally {
        if (active) {
          setProfileLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const result = await reqGetParkSpaces({
          page,
          pageSize: PAGE_SIZE,
          locationId: treeLocationId ?? buildingId,
          status,
          keyword: keyword || undefined,
        })
        if (active) {
          setSpaces(result.items)
          setSpaceTotal(result.total)
          setSpaceError(false)
        }
      } catch {
        if (active) {
          setSpaceError(true)
        }
      } finally {
        if (active) {
          setSpaceLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [buildingId, keyword, page, status, treeLocationId])

  const treeData = useMemo(() => (profile ? createTreeData(profile) : []), [profile])

  const columns = useMemo<TableColumnsType<ParkSpaceDto>>(
    () => [
      ...spaceColumns,
      {
        title: '操作',
        key: 'action',
        width: 90,
        render: (_value, record) => (
          <Button type="link" className="park-space-view" onClick={() => setSelectedSpace(record)}>
            查看
          </Button>
        ),
      },
    ],
    [],
  )

  /**
   * 打开编辑弹窗并填充当前园区信息
   */
  function handleOpenEdit() {
    if (!profile) {
      return
    }

    form.setFieldsValue(profile.info)
    setEditing(true)
  }

  /**
   * 提交园区基础信息修改并刷新页面数据
   */
  async function handleUpdateProfile(values: UpdateParkInfoRequest) {
    setSubmitting(true)
    try {
      const nextProfile = await reqUpdateParkProfile(values)
      setProfile(nextProfile)
      setEditing(false)
      void message.success('园区信息已更新')
    } catch {
      // 接口错误由统一 HTTP 层展示，保留用户填写内容便于修正
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 选中空间树节点后联动右侧空间列表
   */
  function handleTreeSelect(selectedKeys: React.Key[]) {
    const selectedKey = selectedKeys[0]?.toString()
    setTreeLocationId(!selectedKey || selectedKey === PARK_TREE_ROOT_KEY ? undefined : selectedKey)
    setBuildingId(undefined)
    setPage(1)
    setSpaceLoading(true)
  }

  if (profileLoading) {
    return <Skeleton active className="park-profile-loading" paragraph={{ rows: 14 }} />
  }

  if (profileError || !profile) {
    return (
      <Alert
        type="error"
        showIcon
        message="园区档案加载失败"
        description="请稍后刷新页面重试"
      />
    )
  }

  return (
    <div className="park-profile-page">
      {canEdit ? (
        <div className="park-profile-actions">
          <Button type="primary" icon={<EditOutlined />} onClick={handleOpenEdit}>
            编辑园区信息
          </Button>
        </div>
      ) : null}

      <section className="park-overview-card" aria-label="园区基础信息">
        <div className="park-identity">
          <div className="park-identity-icon" aria-hidden="true">
            <BankFilled />
          </div>
          <div className="park-identity-copy">
            <h2>{profile.info.name}</h2>
            <p>以科技创新为核心，打造集研发办公、产业孵化、商务配套于一体的现代化智慧园区。</p>
          </div>
        </div>

        <div className="park-basic-information">
          <h2>基本信息</h2>
          <dl className="park-basic-grid">
            <div className="park-basic-item">
              <dt><EnvironmentOutlined />园区地址</dt>
              <dd>{profile.info.address}</dd>
            </div>
            <div className="park-basic-item">
              <dt><UserOutlined />联系人</dt>
              <dd>{profile.info.contactName}</dd>
            </div>
            <div className="park-basic-item">
              <dt><PhoneOutlined />联系电话</dt>
              <dd>{profile.info.contactPhone}</dd>
            </div>
            <div className="park-basic-item">
              <dt><BorderOutlined />园区面积</dt>
              <dd>{profile.info.area.toLocaleString('zh-CN')} m²</dd>
            </div>
            <div className="park-basic-item park-basic-description">
              <dt><ProfileOutlined />园区介绍</dt>
              <dd>{profile.info.description}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="park-summary-grid" aria-label="园区空间概况">
        {summaryCards.map((card) => (
          <article className="park-summary-card" key={card.key}>
            <div className={`park-summary-icon is-${card.tone}`} aria-hidden="true">
              {card.icon}
            </div>
            <div>
              <p>{card.title}</p>
              <strong>{profile.summary[card.key].toLocaleString('zh-CN')}</strong>
              <span>{card.unit}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="park-space-section">
        <aside className="park-space-tree-panel">
          <h2>楼宇空间</h2>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索楼宇/楼层/空间"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            onPressEnter={() => {
              setKeyword(keywordInput.trim())
              setPage(1)
              setSpaceLoading(true)
            }}
            onClear={() => {
              setKeyword('')
              setPage(1)
              setSpaceLoading(true)
            }}
          />
          <Tree
            blockNode
            showIcon
            defaultExpandedKeys={[PARK_TREE_ROOT_KEY, 'building_a']}
            selectedKeys={[treeLocationId ?? PARK_TREE_ROOT_KEY]}
            treeData={treeData}
            onSelect={handleTreeSelect}
            className="park-space-tree"
          />
        </aside>

        <div className="park-space-table-panel">
          <div className="park-space-table-toolbar">
            <h2>空间概况</h2>
            <div className="park-space-filters">
              <Select
                value={buildingId}
                allowClear
                placeholder="全部楼宇"
                options={profile.buildings.map((building) => ({
                  label: building.name,
                  value: building.id,
                }))}
                onChange={(value) => {
                  setBuildingId(value)
                  setTreeLocationId(undefined)
                  setPage(1)
                  setSpaceLoading(true)
                }}
              />
              <Select
                value={status}
                allowClear
                placeholder="全部状态"
                options={[
                  { label: '已使用', value: 'used' },
                  { label: '空闲', value: 'vacant' },
                ]}
                onChange={(value) => {
                  setStatus(value)
                  setPage(1)
                  setSpaceLoading(true)
                }}
              />
              <Input.Search
                allowClear
                placeholder="搜索空间名称或编号"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onSearch={(value) => {
                  setKeyword(value.trim())
                  setPage(1)
                  setSpaceLoading(true)
                }}
              />
            </div>
          </div>

          {spaceError ? (
            <Alert type="error" showIcon message="空间数据加载失败，请稍后重试" />
          ) : (
            <Table<ParkSpaceDto>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={spaces}
              loading={spaceLoading}
              scroll={{ x: 850 }}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total: spaceTotal,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (nextPage) => {
                  setPage(nextPage)
                  setSpaceLoading(true)
                },
              }}
            />
          )}
        </div>
      </section>

      <Modal
        title="编辑园区信息"
        open={editing}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        onOk={() => form.submit()}
        onCancel={() => setEditing(false)}
        forceRender
      >
        <Form<UpdateParkInfoRequest>
          form={form}
          layout="vertical"
          className="park-profile-form"
          onFinish={handleUpdateProfile}
        >
          <Form.Item label="园区名称" name="name" rules={[{ required: true, whitespace: true }]}>
            <Input maxLength={40} />
          </Form.Item>
          <Form.Item label="园区地址" name="address" rules={[{ required: true, whitespace: true }]}>
            <Input maxLength={80} />
          </Form.Item>
          <div className="park-profile-form-row">
            <Form.Item label="联系人" name="contactName" rules={[{ required: true, whitespace: true }]}>
              <Input maxLength={20} />
            </Form.Item>
            <Form.Item label="联系电话" name="contactPhone" rules={[{ required: true, whitespace: true }]}>
              <Input maxLength={30} />
            </Form.Item>
          </div>
          <Form.Item label="园区面积（㎡）" name="area" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} className="park-profile-area-input" />
          </Form.Item>
          <Form.Item label="园区介绍" name="description" rules={[{ required: true, whitespace: true }]}>
            <Input.TextArea rows={4} maxLength={240} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="空间详情"
        open={Boolean(selectedSpace)}
        footer={null}
        onCancel={() => setSelectedSpace(undefined)}
        destroyOnHidden
      >
        {selectedSpace ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="空间名称">{selectedSpace.name}</Descriptions.Item>
            <Descriptions.Item label="所属位置">
              {selectedSpace.buildingName} · {selectedSpace.floorName}
            </Descriptions.Item>
            <Descriptions.Item label="空间类型">{selectedSpace.type}</Descriptions.Item>
            <Descriptions.Item label="空间面积">{selectedSpace.area} ㎡</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              {selectedSpace.status === 'used' ? '已使用' : '空闲'}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  )
}

export default ParkProfilePage
