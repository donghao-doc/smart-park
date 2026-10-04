import type { VehicleDto } from '@/types/vehicle'
import { seedEnterprises } from './enterprises'

const plates = [
  '京A12345', '京B67890', '沪C88888', '粤B12378', '浙A55667',
  '苏D99887', '京A88999', '沪A76543', '粤A33221', '川A99876',
]
const owners = ['李明', '王芳', '张三', '刘强', '陈洁', '赵敏', '周磊', '孙丽', '吴刚', '郑伟']
const prefixes = ['浙A', '沪B', '苏C', '粤D', '京E', '川F']

/** 生成可筛选、分页且车牌唯一的车辆档案，包含新能源车牌样例 */
function createVehicle(index: number): VehicleDto {
  const enterprise = seedEnterprises[index % 12]
  const plateNumber = plates[index] ?? (
    index % 9 === 0
      ? `${prefixes[index % prefixes.length]}D${String(10_000 + index)}`
      : `${prefixes[index % prefixes.length]}${String(10_000 + index)}`
  )

  return {
    id: `veh_${1001 + index}`,
    plateNumber,
    type: index % 3 === 1 ? 'visitor' : 'employee',
    ownerName: owners[index % owners.length],
    enterpriseId: enterprise.id,
    enterpriseName: enterprise.name,
    phone: `13${[8, 9, 6, 7][index % 4]}${String(1380_0000 + index).padStart(8, '0')}`,
    status: index % 10 === 3 || index % 10 === 6 ? 'disabled' : 'active',
    createdAt: new Date(Date.UTC(2024, 0, 1, 0, -index * 30)).toISOString(),
    updatedAt: new Date(Date.UTC(2024, 3, 22, 2, 24 - index * 66)).toISOString(),
  }
}

/** 车辆档案模块使用的 128 条初始数据 */
export const seedVehicles: VehicleDto[] = Array.from({ length: 128 }, (_, index) =>
  createVehicle(index),
)
