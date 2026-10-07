# 智慧园区理性蓝页面设计稿

本目录按 PRD 首期 18 个页面列出设计索引，当前包含 16 份高保真视觉稿，403 和 404 页面暂未提供设计稿。整体方案基于已选定的“01 理性蓝”方向，图片用于确定布局、层级和视觉规范，不作为像素级标注稿。

## 视觉基准

- 背景：冷白与浅冷灰
- 主色：`#1677FF`
- 主文字：深海军蓝
- 容器：白色、8px 圆角、细灰边框、极弱阴影
- 布局：8px 间距网格，适中信息密度
- 图标：统一的线性图标
- 状态色：蓝色表示处理中，绿色表示正常或完成，橙色表示待处理，红色表示异常

## 页面索引

| 编号 | 页面 | 路由 | 设计稿 |
| --- | --- | --- | --- |
| 01 | 登录 | `/login` | [查看](./01-login.png) |
| 02 | 运营总览 | `/dashboard` | [查看](./02-dashboard.png) |
| 03 | 园区档案 | `/park/profile` | [查看](./03-park-profile.png) |
| 04 | 企业列表 | `/enterprises` | [查看](./04-enterprise-list.png) |
| 05 | 企业详情 | `/enterprises/:id` | [查看](./05-enterprise-detail.png) |
| 06 | 人员列表 | `/personnel` | [查看](./06-personnel-list.png) |
| 07 | 访客预约 | `/visitors/appointments` | [查看](./07-visitor-appointments.png) |
| 08 | 到访记录 | `/visitors/records` | [查看](./08-visitor-records.png) |
| 09 | 车辆档案 | `/parking/vehicles` | [查看](./09-vehicle-list.png) |
| 10 | 停车记录 | `/parking/records` | [查看](./10-parking-records.png) |
| 11 | 工单中心 | `/work-orders` | [查看](./11-work-order-list.png) |
| 12 | 工单详情 | `/work-orders/:id` | [查看](./12-work-order-detail.png) |
| 13 | 设备列表 | `/devices` | [查看](./13-device-list.png) |
| 14 | 用户管理 | `/system/users` | [查看](./14-user-list.png) |
| 15 | 操作日志 | `/system/logs` | [查看](./15-operation-logs.png) |
| 16 | Mock 数据管理 | `/system/mock-data` | [查看](./16-mock-data.png) |
| 17 | 无权限 | `/403` | 暂未提供 |
| 18 | 未找到 | `*` | 暂未提供 |

## 实现建议

- 列表页复用筛选栏、表格、状态标签和分页组件
- 详情页复用信息分组、标签页、时间线和右侧状态面板
- 登录、403、404 共用浅蓝几何线稿语言
- 页面中的企业、人员、号码和日期均为演示内容，实现时以 MSW 数据为准
- 生成时使用的提示词记录在 [PROMPTS.md](./PROMPTS.md)
