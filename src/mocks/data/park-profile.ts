import type { ParkBuildingDto, ParkInfoDto, ParkSpaceDto } from '@/types/park-profile'

/** 园区基础信息初始数据 */
export const seedParkInfo: ParkInfoDto = {
  id: 'park_1001',
  name: '未来科技园',
  address: '北京市海淀区中关村大街1号',
  contactName: '李四',
  contactPhone: '010-8888 6666',
  area: 120_000,
  description:
    '未来科技园聚焦人工智能、集成电路、新能源等前沿产业，提供高品质办公空间与完善的配套服务，致力于打造开放、协同、创新的产业生态。',
}

/** 园区楼宇与楼层树初始数据 */
export const parkBuildings: ParkBuildingDto[] = [
  {
    id: 'building_a',
    name: 'A栋',
    description: '研发中心',
    floors: Array.from({ length: 5 }, (_, index) => ({
      id: `building_a_floor_${index + 1}`,
      name: `${index + 1}层`,
    })),
  },
  {
    id: 'building_b',
    name: 'B栋',
    description: '创新中心',
    floors: Array.from({ length: 11 }, (_, index) => ({
      id: `building_b_floor_${index + 1}`,
      name: `${index + 1}层`,
    })),
  },
  {
    id: 'building_c',
    name: 'C栋',
    description: '企业服务中心',
    floors: Array.from({ length: 12 }, (_, index) => ({
      id: `building_c_floor_${index + 1}`,
      name: `${index + 1}层`,
    })),
  },
  {
    id: 'building_d',
    name: 'D栋',
    description: '人才公寓',
    floors: Array.from({ length: 16 }, (_, index) => ({
      id: `building_d_floor_${index + 1}`,
      name: `${index + 1}层`,
    })),
  },
  {
    id: 'building_e',
    name: 'E栋',
    description: '配套商业',
    floors: Array.from({ length: 12 }, (_, index) => ({
      id: `building_e_floor_${index + 1}`,
      name: `${index + 1}层`,
    })),
  },
  {
    id: 'building_f',
    name: 'F栋',
    description: '联合办公',
    floors: [],
  },
  {
    id: 'building_g',
    name: 'G栋',
    description: '研发中心',
    floors: [],
  },
  {
    id: 'building_h',
    name: 'H栋',
    description: '总部办公',
    floors: [],
  },
]

/** 园区空间概况展示数据 */
export const parkSpaces: ParkSpaceDto[] = [
  {
    id: 'space_a_101',
    name: 'A-101',
    buildingId: 'building_a',
    buildingName: 'A栋',
    floorId: 'building_a_floor_1',
    floorName: '1层',
    type: '办公空间',
    area: 120,
    status: 'used',
  },
  {
    id: 'space_a_102',
    name: 'A-102',
    buildingId: 'building_a',
    buildingName: 'A栋',
    floorId: 'building_a_floor_1',
    floorName: '1层',
    type: '办公空间',
    area: 150,
    status: 'vacant',
  },
  {
    id: 'space_a_201',
    name: 'A-201',
    buildingId: 'building_a',
    buildingName: 'A栋',
    floorId: 'building_a_floor_2',
    floorName: '2层',
    type: '办公空间',
    area: 200,
    status: 'used',
  },
  {
    id: 'space_b_301',
    name: 'B-301',
    buildingId: 'building_b',
    buildingName: 'B栋',
    floorId: 'building_b_floor_3',
    floorName: '3层',
    type: '办公空间',
    area: 180,
    status: 'vacant',
  },
  {
    id: 'space_b_302',
    name: 'B-302',
    buildingId: 'building_b',
    buildingName: 'B栋',
    floorId: 'building_b_floor_3',
    floorName: '3层',
    type: '会议室',
    area: 80,
    status: 'used',
  },
  {
    id: 'space_c_401',
    name: 'C-401',
    buildingId: 'building_c',
    buildingName: 'C栋',
    floorId: 'building_c_floor_4',
    floorName: '4层',
    type: '办公空间',
    area: 220,
    status: 'vacant',
  },
  {
    id: 'space_c_402',
    name: 'C-402',
    buildingId: 'building_c',
    buildingName: 'C栋',
    floorId: 'building_c_floor_4',
    floorName: '4层',
    type: '办公空间',
    area: 160,
    status: 'used',
  },
  {
    id: 'space_d_501',
    name: 'D-501',
    buildingId: 'building_d',
    buildingName: 'D栋',
    floorId: 'building_d_floor_5',
    floorName: '5层',
    type: '办公空间',
    area: 100,
    status: 'vacant',
  },
]
