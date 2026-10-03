import { Alert, App, Skeleton } from 'antd'
import { useEffect, useState } from 'react'

import {
  reqGetParkProfile,
  reqGetParkSpaces,
  reqUpdateParkProfile,
} from '@/api'
import { useUserStore } from '@/stores/user'
import type {
  ParkProfileDto,
  ParkSpaceDto,
  ParkSpaceStatus,
  UpdateParkInfoRequest,
} from '@/types/park-profile'
import ParkOverviewCard from './components/park-overview-card'
import ParkProfileEditModal from './components/park-profile-edit-modal'
import ParkSpaceSummary from './components/park-space-summary'
import ParkSpaceTablePanel from './components/park-space-table-panel'
import ParkSpaceTreePanel from './components/park-space-tree-panel'
import './park-profile.scss'

const PAGE_SIZE = 8

/**
 * 园区档案页面，展示并维护园区基础信息与楼宇空间资源
 */
function ParkProfilePage() {
  const { message } = App.useApp()
  const [profile, setProfile] = useState<ParkProfileDto>()
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const canEdit = useUserStore((state) => state.hasPermission('park:update'))
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

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const profileData = await reqGetParkProfile()
        if (active) {
          setProfile(profileData)
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
  function handleTreeLocationChange(locationId?: string) {
    setTreeLocationId(locationId)
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
      {/* 园区基础信息 */}
      <ParkOverviewCard
        info={profile.info}
        canEdit={canEdit}
        onEdit={() => setEditing(true)}
      />

      {/* 园区空间概况 */}
      <ParkSpaceSummary summary={profile.summary} />

      <section className="park-space-section">
        {/* 楼宇空间 */}
        <ParkSpaceTreePanel
          profile={profile}
          selectedLocationId={treeLocationId}
          keywordInput={keywordInput}
          onKeywordChange={setKeywordInput}
          onKeywordSearch={(value) => {
            setKeyword(value)
            setPage(1)
            setSpaceLoading(true)
          }}
          onLocationChange={handleTreeLocationChange}
        />

        {/* 空间概况 */}
        <ParkSpaceTablePanel
          buildings={profile.buildings}
          spaces={spaces}
          total={spaceTotal}
          page={page}
          pageSize={PAGE_SIZE}
          buildingId={buildingId}
          status={status}
          keywordInput={keywordInput}
          loading={spaceLoading}
          error={spaceError}
          onBuildingChange={(value) => {
            setBuildingId(value)
            setTreeLocationId(undefined)
            setPage(1)
            setSpaceLoading(true)
          }}
          onStatusChange={(value) => {
            setStatus(value)
            setPage(1)
            setSpaceLoading(true)
          }}
          onKeywordChange={setKeywordInput}
          onKeywordSearch={(value) => {
            setKeyword(value)
            setPage(1)
            setSpaceLoading(true)
          }}
          onPageChange={(nextPage) => {
            setPage(nextPage)
            setSpaceLoading(true)
          }}
        />
      </section>

      {/* 编辑园区信息 */}
      <ParkProfileEditModal
        open={editing}
        info={profile.info}
        submitting={submitting}
        onSubmit={handleUpdateProfile}
        onCancel={() => setEditing(false)}
      />
    </div>
  )
}

export default ParkProfilePage
