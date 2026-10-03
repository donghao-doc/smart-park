import type {
  PersonnelCertificateType,
  PersonnelDto,
  PersonnelStatus,
} from '@/types/personnel'
import { seedEnterprises } from './enterprises'

const familyNames = ['张', '李', '王', '赵', '孙', '周', '吴', '郑', '陈', '刘', '杨', '黄']
const givenNames = ['三', '四', '五', '六', '七', '八', '九', '十', '一', '二', '明', '芳']
const departments = ['综合管理部', '技术研发部', '产品部', '市场部', '运营部', '财务部', '人力资源部', '行政部']

/**
 * 创建指定序号的人员种子数据
 */
function createPersonnel(index: number): PersonnelDto {
  const sequence = index + 1
  const enterprise = seedEnterprises[index % 6]
  const status: PersonnelStatus = index % 11 === 2
    ? 'resigned'
    : index % 11 === 5
      ? 'suspended'
      : 'active'
  const certificateType: PersonnelCertificateType = index % 13 === 7
    ? 'hk_macao_permit'
    : index % 13 === 3
      ? 'passport'
      : 'identity_card'
  const birthDate = `${1990 + (index % 10)}${String((index % 12) + 1).padStart(2, '0')}${String((index % 28) + 1).padStart(2, '0')}`
  const certificateNumber = certificateType === 'identity_card'
    ? `330106${birthDate}${String(100 + (sequence % 899)).padStart(3, '0')}${index % 2 === 0 ? '8' : 'X'}`
    : certificateType === 'passport'
      ? `E${String(12_345_678 + index * 97).slice(-8)}`
      : `H${String(12_345_678 + index * 113).slice(-8)}`

  return {
    id: `per_${String(1001 + index)}`,
    name: `${familyNames[index % familyNames.length]}${givenNames[index % givenNames.length]}`,
    phone: `1${[3, 5, 8, 6, 7][index % 5]}${String(800_000_000 + index * 137).slice(-9)}`,
    certificateType,
    certificateNumber,
    employeeNumber: `GZ${String(sequence).padStart(3, '0')}`,
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    department: departments[index % departments.length],
    status,
    createdAt: `2024-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00.000Z`,
    updatedAt: `2024-04-${String((index % 22) + 1).padStart(2, '0')}T10:00:00.000Z`,
  }
}

/** 人员管理模块使用的 128 条初始数据 */
export const seedPersonnel: PersonnelDto[] = Array.from({ length: 128 }, (_, index) =>
  createPersonnel(index),
)
