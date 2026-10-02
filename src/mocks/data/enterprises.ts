import type {
  EnterpriseActivityDto,
  EnterpriseDetailDto,
  EnterpriseMemberDto,
  EnterpriseStatus,
  EnterpriseVehicleDto,
  EnterpriseWorkOrderDto,
} from '../../types/enterprise'

/**
 * Mock 层内部使用的完整企业实体
 */
export interface MockEnterpriseEntity extends EnterpriseDetailDto {
  /** 企业数据创建时间，ISO 8601 格式 */
  createdAt: string
  /** 企业数据最后更新时间，ISO 8601 格式 */
  updatedAt: string
}

const names = [
  '星河科技有限公司',
  '绿源环境科技有限公司',
  '智联物联技术有限公司',
  '创想文化传媒有限公司',
  '远航供应链管理有限公司',
  '数云数据服务有限公司',
  '安行智能科技有限公司',
  '蓝海生物医药有限公司',
  '天诚建筑设计有限公司',
  '和合教育科技有限公司',
]

const industries = ['信息技术', '节能环保', '智能制造', '文化传媒', '物流仓储', '大数据', '人工智能', '生物医药', '建筑设计', '教育科技']
const contacts = ['李明', '王芳', '陈刚', '刘洋', '张婷', '赵雷', '孙悦', '周杰', '吴敏', '郑凯']
const buildings = ['A区1号楼201', 'A区2号楼305', 'B区3号楼402', 'B区5号楼501', 'C区1号楼101', 'C区2号楼203', 'D区4号楼301', 'D区6号楼601', 'E区1号楼102', 'E区3号楼303']

const starActivities: EnterpriseActivityDto[] = [
  { id: 'act_1001', occurredAt: '2024-04-20T14:32:00.000Z', content: '企业更新了联系人信息' },
  { id: 'act_1002', occurredAt: '2024-04-18T09:15:00.000Z', content: '新增备案车辆 浙A·8F3K2' },
  { id: 'act_1003', occurredAt: '2024-04-10T16:20:00.000Z', content: '提交了入驻续期申请' },
  { id: 'act_1004', occurredAt: '2024-03-28T11:05:00.000Z', content: '关联工单 #20240328001 已完成' },
  { id: 'act_1005', occurredAt: '2024-03-12T10:18:00.000Z', content: '新增企业成员 王芳' },
]

const starMembers: EnterpriseMemberDto[] = [
  { id: 'mem_1001', name: '李明', department: '行政部', title: '行政经理', phone: '13800001234', status: 'active' },
  { id: 'mem_1002', name: '王芳', department: '研发部', title: '产品经理', phone: '13900005678', status: 'active' },
  { id: 'mem_1003', name: '陈刚', department: '技术部', title: '算法工程师', phone: '13600007890', status: 'active' },
]

const starVehicles: EnterpriseVehicleDto[] = [
  { id: 'veh_1001', plateNumber: '浙A·8F3K2', type: '员工车', ownerName: '李明', status: 'active' },
  { id: 'veh_1002', plateNumber: '浙A·6Q5M8', type: '公务车', ownerName: '王芳', status: 'active' },
  { id: 'veh_1003', plateNumber: '浙A·2L7P9', type: '员工车', ownerName: '陈刚', status: 'active' },
]

const starWorkOrders: EnterpriseWorkOrderDto[] = [
  { id: 'wo_1001', code: 'WO202404180008', title: '会议室空调温度异常', status: 'processing', createdAt: '2024-04-18T08:40:00.000Z' },
  { id: 'wo_1002', code: 'WO202403280001', title: '办公区门禁权限调整', status: 'completed', createdAt: '2024-03-28T09:12:00.000Z' },
  { id: 'wo_1003', code: 'WO202403120006', title: '网络端口开通申请', status: 'completed', createdAt: '2024-03-12T13:25:00.000Z' },
]

/**
 * 创建企业详情默认关联数据
 */
function createRelations(index: number) {
  if (index === 0) {
    return {
      activities: starActivities,
      members: starMembers,
      vehicles: starVehicles,
      workOrders: starWorkOrders,
    }
  }

  return {
    activities: [
      {
        id: `act_${index + 1001}`,
        occurredAt: '2024-04-16T10:00:00.000Z',
        content: '企业基础资料完成例行更新',
      },
    ],
    members: [],
    vehicles: [],
    workOrders: [],
  }
}

/**
 * 创建指定序号的企业种子数据
 */
function createEnterprise(index: number): MockEnterpriseEntity {
  const listIndex = index % names.length
  const sequence = index + 1
  const baseName = names[listIndex]
  const name = index < names.length ? baseName : `${baseName.replace('有限公司', '')}${Math.floor(index / names.length) + 1}有限公司`
  const status: EnterpriseStatus = index % 8 === 3 || index % 8 === 7 ? 'disabled' : 'active'
  const location = buildings[listIndex]
  const buildingName = location.slice(0, location.indexOf('楼') + 1)
  const floorNumber = location.slice(location.indexOf('楼') + 1, -2).slice(0, 1)
  const roomName = location.slice(location.indexOf('楼') + 1)
  const relations = createRelations(index)

  return {
    id: `ent_${String(1001 + index)}`,
    name,
    creditCode: `91330108MA2B1C${String(3_000 + sequence).slice(-4)}`,
    industry: industries[listIndex],
    contactName: contacts[listIndex],
    contactPhone: `13${8 + (listIndex % 2)}${String(12_345_678 + index * 137).slice(-8)}`,
    officeLocation: location,
    status,
    companyType: '有限责任公司',
    registeredCapital: `${1_000 + index * 20} 万元人民币`,
    foundedAt: index === 0 ? '2020-06-15' : `20${18 + (index % 6)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
    businessScope: '一般项目：软件开发；物联网设备制造；智能系统集成；技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；数据处理和存储支持服务；货物进出口。',
    description: index === 0
      ? '星河科技有限公司是一家专注于人工智能与物联网技术的高新技术企业，致力于为智慧园区、智慧城市、智能制造等领域提供产品研发与行业解决方案。'
      : `${name}专注于${industries[listIndex]}领域，为园区客户提供专业、稳定的产品与服务。`,
    contact: {
      name: contacts[listIndex],
      title: index === 0 ? '行政经理' : '企业联系人',
      phone: index === 0 ? '138 0000 1234' : `13${8 + (listIndex % 2)} ${String(1_234 + index).padStart(4, '0')} ${String(5_678 + index).slice(-4)}`,
      telephone: index === 0 ? '0571-8888 1234' : `0571-88${String(10_000 + index).slice(-6)}`,
      email: index === 0 ? 'liming@xinghetech.com' : `contact${sequence}@example.com`,
      address: index === 0 ? '浙江省杭州市滨江区江南大道 518 号智慧园区A栋12层' : `浙江省杭州市滨江区智慧园区${location}`,
    },
    office: {
      parkName: '智慧园区A区',
      buildingName: index === 0 ? 'A栋' : buildingName,
      floorName: index === 0 ? '12层' : `${floorNumber || '1'}层`,
      roomName: index === 0 ? '1201-1205' : roomName,
      address: index === 0 ? '浙江省杭州市滨江区江南大道 518 号智慧园区A栋12层' : `浙江省杭州市滨江区智慧园区${location}`,
    },
    metrics: {
      memberCount: index === 0 ? 86 : 18 + (index * 7) % 90,
      vehicleCount: index === 0 ? 24 : 5 + (index * 3) % 35,
      workOrderCount: index === 0 ? 18 : 2 + (index * 5) % 26,
      tenancyDuration: index === 0 ? '3 年 10 个月' : `${1 + (index % 5)} 年 ${index % 12} 个月`,
    },
    ...relations,
    createdAt: `2024-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00.000Z`,
    updatedAt: `2024-04-${String((index % 22) + 1).padStart(2, '0')}T10:00:00.000Z`,
  }
}

/** 企业管理模块使用的 128 条初始数据 */
export const seedEnterprises: MockEnterpriseEntity[] = Array.from({ length: 128 }, (_, index) =>
  createEnterprise(index),
)
