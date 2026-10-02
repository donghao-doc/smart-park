import {
  ApartmentOutlined,
  BankFilled,
  HomeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { TreeDataNode } from 'antd'
import { Input, Tree } from 'antd'
import { useMemo } from 'react'
import type { Key } from 'react'

import type { ParkProfileDto } from '../../../types/park-profile'
import './park-space-tree-panel.scss'

const PARK_TREE_ROOT_KEY = 'park-root'

interface ParkSpaceTreePanelProps {
  /** 园区档案数据 */
  profile: ParkProfileDto
  /** 当前选中的楼宇或楼层标识 */
  selectedLocationId?: string
  /** 当前空间搜索词 */
  keywordInput: string
  /** 更新空间搜索词 */
  onKeywordChange: (value: string) => void
  /** 提交空间搜索 */
  onKeywordSearch: (value: string) => void
  /** 切换楼宇或楼层筛选 */
  onLocationChange: (locationId?: string) => void
}

/**
 * 将园区楼宇数据转换为空间树节点
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
 * 展示楼宇与楼层树，并提供空间关键字搜索入口
 */
function ParkSpaceTreePanel({
  profile,
  selectedLocationId,
  keywordInput,
  onKeywordChange,
  onKeywordSearch,
  onLocationChange,
}: ParkSpaceTreePanelProps) {
  const treeData = useMemo(() => createTreeData(profile), [profile])

  /**
   * 将根节点选择转换为不限制楼宇位置
   */
  function handleTreeSelect(selectedKeys: Key[]) {
    const selectedKey = selectedKeys[0]?.toString()
    onLocationChange(!selectedKey || selectedKey === PARK_TREE_ROOT_KEY ? undefined : selectedKey)
  }

  return (
    <aside className="park-space-tree-panel">
      <h2>楼宇空间</h2>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="搜索楼宇/楼层/空间"
        value={keywordInput}
        onChange={(event) => onKeywordChange(event.target.value)}
        onPressEnter={() => onKeywordSearch(keywordInput.trim())}
        onClear={() => onKeywordSearch('')}
      />
      <Tree
        blockNode
        showIcon
        defaultExpandedKeys={[PARK_TREE_ROOT_KEY, 'building_a']}
        selectedKeys={[selectedLocationId ?? PARK_TREE_ROOT_KEY]}
        treeData={treeData}
        onSelect={handleTreeSelect}
        className="park-space-tree"
      />
    </aside>
  )
}

export default ParkSpaceTreePanel
