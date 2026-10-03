import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Tag, type TableColumnsType } from 'antd'
import { useMemo } from 'react'

import DataTablePanel from '../../../components/data-table-panel'
import type {
  PersonnelCertificateType,
  PersonnelDto,
  PersonnelStatus,
} from '../../../types/personnel'
import { maskPhoneNumber } from '../../../utils/privacy'
import './personnel-table.scss'

interface PersonnelTableProps {
  /** 当前页人员数据 */
  personnel: PersonnelDto[]
  /** 满足筛选条件的人员总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页展示数量 */
  pageSize: number
  /** 列表是否正在加载 */
  loading: boolean
  /** 列表加载是否失败 */
  loadError: boolean
  /** 当前用户是否可以新增人员 */
  canCreate: boolean
  /** 当前用户是否可以编辑人员 */
  canUpdate: boolean
  /** 打开新增人员表单 */
  onCreate: () => void
  /** 查看指定人员 */
  onView: (personnelId: string) => void
  /** 编辑指定人员 */
  onEdit: (personnelId: string) => void
  /** 重新加载当前页数据 */
  onRetry: () => void
  /** 更新页码和每页展示数量 */
  onPageChange: (page: number, pageSize: number) => void
}

const certificateTypeLabels: Record<PersonnelCertificateType, string> = {
  identity_card: '身份证',
  passport: '护照',
  hk_macao_permit: '港澳通行证',
}

const statusLabels: Record<PersonnelStatus, string> = {
  active: '在职',
  resigned: '离职',
  suspended: '停用',
}

/**
 * 隐藏证件号码中间区域，仅保留便于核对的首尾字符
 */
function maskCertificateNumber(value: string) {
  if (value.length <= 8) {
    return value
  }

  return `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`
}

/**
 * 人员列表表格，负责敏感信息脱敏、状态展示、操作入口和分页交互
 */
function PersonnelTable({
  personnel,
  total,
  page,
  pageSize,
  loading,
  loadError,
  canCreate,
  canUpdate,
  onCreate,
  onView,
  onEdit,
  onRetry,
  onPageChange,
}: PersonnelTableProps) {
  const columns = useMemo<TableColumnsType<PersonnelDto>>(
    () => [
      { title: '姓名', dataIndex: 'name', width: 90 },
      {
        title: '手机号',
        dataIndex: 'phone',
        width: 130,
        render: (phone: string) => maskPhoneNumber(phone),
      },
      {
        title: '证件类型',
        dataIndex: 'certificateType',
        width: 120,
        render: (type: PersonnelCertificateType) => certificateTypeLabels[type],
      },
      {
        title: '证件号码',
        dataIndex: 'certificateNumber',
        width: 180,
        render: (value: string) => maskCertificateNumber(value),
      },
      { title: '工号', dataIndex: 'employeeNumber', width: 100 },
      { title: '所属企业', dataIndex: 'enterpriseName', width: 210, ellipsis: true },
      { title: '部门', dataIndex: 'department', width: 130, ellipsis: true },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: (status: PersonnelStatus) => (
          <Tag className={`personnel-status-tag is-${status}`} variant="filled">
            {statusLabels[status]}
          </Tag>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: canUpdate ? 120 : 64,
        fixed: 'right',
        render: (_value, record) => (
          <Flex className="personnel-table-actions" gap={2}>
            <Button type="link" onClick={() => onView(record.id)}>查看</Button>
            {canUpdate ? (
              <Button type="link" onClick={() => onEdit(record.id)}>编辑</Button>
            ) : null}
          </Flex>
        ),
      },
    ],
    [canUpdate, onEdit, onView],
  )

  return (
    <DataTablePanel<PersonnelDto>
      ariaLabel="人员列表"
      className="personnel-table-panel"
      toolbar={
        canCreate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            新增人员
          </Button>
        ) : undefined
      }
      feedback={
        loadError ? (
          <Alert
            type="error"
            showIcon
            message="人员列表加载失败"
            action={<Button size="small" onClick={onRetry}>重试</Button>}
          />
        ) : undefined
      }
      tableProps={{
        rowKey: 'id',
        rowSelection: {},
        columns,
        dataSource: personnel,
        loading,
      }}
      scrollX={1220}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
      }}
    />
  )
}

export default PersonnelTable
