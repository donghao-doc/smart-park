import type { DeviceDetailDto, DeviceStatus, DeviceType } from '@/types/device'

const names = [
  '园区东门摄像头', 'A栋1层门禁机', 'B区电梯监控', '园区南门道闸', 'C栋环境传感器',
  '园区广播系统', 'D栋消防主机', '地下车库车位相机', 'A区能耗计量表', '园区北门人脸识别',
]
const types: DeviceType[] = [
  'camera', 'access', 'camera', 'parking', 'environment',
  'broadcast', 'fire', 'parking', 'energy', 'access',
]
const locations = [
  'A区 东门', 'A区 A栋1层', 'B区 B栋', '南门', 'C区 C栋3层',
  'A区 中庭', 'D区 D栋1层', '地下车库', 'A区 设备间', '北门',
]
const owners = ['李四', '王五', '张三', '赵六', '陈华', '刘洋', '黄磊', '周明', '吴芳', '郑凯']
const initialStatuses: DeviceStatus[] = [
  'normal', 'normal', 'fault', 'normal', 'offline',
  'normal', 'fault', 'normal', 'disabled', 'normal',
]

/** 生成设计稿对应的首屏档案及覆盖四种状态的分页数据 */
function createDevice(index: number): DeviceDetailDto {
  // 总数为 892，四种状态数量分别为 648、64、156、24，避免设计稿统计不一致
  const status = initialStatuses[index] ?? (
    index < 652 ? 'normal' : index < 714 ? 'fault' : index < 869 ? 'offline' : 'disabled'
  )
  const updatedAt = new Date(Date.UTC(2024, 3, 22, 2, 18 - index * 6)).toISOString()
  const createdAt = new Date(Date.UTC(2024, 0, 10, 0, -index)).toISOString()
  return {
    id: `device_${1001 + index}`,
    code: `DEV${String(index + 1).padStart(3, '0')}`,
    name: names[index] ?? `${names[index % names.length]} ${Math.floor(index / 10) + 1}号`,
    type: types[index % types.length],
    location: locations[index % locations.length],
    ownerName: owners[index % owners.length],
    status,
    createdAt,
    updatedAt,
    statusRecords: [
      {
        id: `device_record_${index}_latest`,
        previousStatus: status === 'normal' ? 'offline' : 'normal',
        status,
        operatorName: '模拟设备平台',
        changedAt: updatedAt,
      },
      {
        id: `device_record_${index}_created`,
        previousStatus: null,
        status: 'normal',
        operatorName: '园区运营员',
        changedAt: createdAt,
      },
    ],
  }
}

/** 设备管理使用的 892 条初始档案，包含可追溯的状态记录 */
export const seedDevices: DeviceDetailDto[] = Array.from({ length: 892 }, (_, index) => createDevice(index))
