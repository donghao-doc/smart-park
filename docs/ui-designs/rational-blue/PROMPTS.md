# 理性蓝页面设计稿提示词

本组图片使用内置 ImageGen 生成。每个页面均单独生成，并以 `docs/ui-concepts/01-rational-blue.png` 作为视觉参考图。

## 公共提示词

```text
Use case: ui-mockup
Asset type: production-ready desktop web admin page for the “智慧园区” project
Input images: Image 1 is the approved rational-blue style reference only
Style: cool-white background, #1677FF primary blue, deep navy text, pale cool-gray canvas, white panels, 8px corner radius, thin gray borders, almost no shadow, compact outline icons, disciplined 8px spacing grid, practical enterprise information density
Scene/backdrop: full 1440×900 desktop application screenshot, straight-on, no browser chrome, no device frame
Constraints: accurate Chinese UI labels where visible; realistic shippable layout; consistent sidebar and header; no photos; no watermark
Avoid: dark theme, black large surfaces, beige, cream, paper texture, purple-pink gradient, neon, glassmorphism, floating blobs, 3D ornaments, sci-fi HUD, generic AI dashboard style
```

## 页面提示词

```text
01 登录：品牌“智慧园区”；“欢迎登录”；用户名和密码；记住账号；登录按钮；超级管理员、园区运营人员、企业用户三个演示账号；无后台侧栏；浅蓝园区几何线稿背景

02 运营总览：六个 KPI；近 7 日访客趋势；工单趋势；今日待办；设备状态；完整侧栏与顶部栏

03 园区档案：“未来科技园”基本资料；楼宇、楼层、办公空间、已使用空间指标；楼宇空间树；空间概况表格；编辑园区信息

04 企业列表：企业名称和状态筛选；新增企业；统一社会信用代码、行业、联系人、电话、办公位置、状态和操作列；分页

05 企业详情：“星河科技有限公司”；已入驻状态；企业信息、成员、车辆、关联工单标签页；基本信息、联系人、办公位置和最近动态

06 人员列表：姓名、手机号、所属企业和状态筛选；证件类型与脱敏证件号码；工号、部门、在职、离职和停用状态

07 访客预约：待审批、待到访、已到访、已离园统计；创建预约；预约编号、访客、受访人、企业、时间、车牌、状态；通过、驳回、签到、签出操作

08 到访记录：访客、企业、日期和状态筛选；今日到访与今日离园；预约、签到、签出时间；只读历史记录

09 车辆档案：车牌、车辆类型、企业和状态筛选；新增车辆；员工车与访客车；车主、联系电话、更新时间和启停状态

10 停车记录：当前在场、今日入场、今日出场、异常车辆指标；车牌、进出时间、入口、出口、停留时长；在场、已离场、无权限和超时状态

11 工单中心：待受理、待处理、处理中、待确认、已完成指标；创建工单；工单编号、标题、类型、企业、紧急程度、处理人、时间、状态和操作

12 工单详情：工单“WO202409190018 空调无法制冷”；待确认；工单信息、问题描述、图片、处理记录时间线、当前状态和关联信息；确认完成、提交评价、重新打开

13 设备列表：设备总数、正常、故障、离线、停用指标；设备名称、类型、位置和状态筛选；设备编码、责任人、更新时间和操作

14 用户管理：仅超级管理员访问；用户名、姓名、角色和状态筛选；超级管理员、园区运营人员、企业用户三个固定角色；新增、编辑、重置密码和停用

15 操作日志：操作人、模块、时间和结果筛选；操作时间、角色、动作、对象、IP、结果；右侧打开日志详情抽屉，展示失败原因。生成后进行一次定向文字修正，将角色示例统一为超级管理员、园区运营人员和企业用户

16 Mock 数据管理：标准种子数据、本地数据版本和最近重置时间；接口延迟滑块；按模块开启异常响应及选择状态码；恢复初始数据；保存设置；不显示导入、导出或多数据集切换

17 403：顶部品牌栏；盾牌锁图标；“403”“暂无访问权限”；返回首页和返回上一页

18 404：顶部品牌栏；地图和中断路线线稿；“404”“页面不存在”；返回首页和返回上一页
```
