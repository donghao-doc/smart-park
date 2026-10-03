# 项目开发规范

## 字号规范

- 页面正文、表单文字、按钮文字、菜单文字及其他常规界面文字默认使用 `14px`
- 辅助说明、次要提示、元数据等小号文字使用 `12px`
- 任何文字字号不得小于 `12px`，包括 Ant Design 组件内部文字、响应式样式和状态提示
- 页面标题、模块标题、品牌文字等强调内容可根据视觉层级使用更大字号，但应保持层级清晰，避免将 `16px` 作为常规正文大小
- Ant Design 全局主题字号应保持 `fontSize: 14`、`fontSizeSM: 12`；组件需要单独覆盖字号时，应与上述规则一致

## Ant Design 组件使用规范

- 项目已经使用 Ant Design。实现前端界面时，应先检查 Ant Design 是否提供了满足需求的组件；能够使用现有组件完成的功能，优先使用 Ant Design，不要重复使用原生标签配合自定义样式和 JavaScript 实现
- 按钮、菜单、抽屉、弹窗、下拉菜单、表单、输入框、表格、分页、标签页、提示反馈等常见交互组件，应默认使用 Ant Design 对应组件
- 界面图标应优先使用项目已有的 `@ant-design/icons` 图标库，并选择语义最接近的图标；不要在已有合适图标时自行绘制 SVG、使用字符或 Emoji 模拟图标，也不要为单个常见图标额外引入新的图标依赖
- 涉及遮罩、焦点管理、键盘操作、滚动锁定、弹层层级、打开关闭动画和无障碍语义时，应使用 Ant Design 已有能力，不要自行重复实现
- 原生语义标签仍可用于页面结构和静态内容，例如 `main`、`header`、`aside`、`nav`、`section`、标题和普通文本；Ant Design 没有合适组件或使用组件会降低语义和可维护性时，也可以使用原生标签
- 使用 Ant Design 组件时，交互能力优先通过组件属性配置，视觉样式通过语义化 `className` 和对应 SCSS 文件调整，避免大量内联样式
- 如果明确不使用已有的 Ant Design 组件，应确保存在兼容性、语义、性能或业务定制方面的合理原因

## Ant Design 布局组件使用规范

- 开发页面或组件布局前，应先检查 Ant Design 是否提供适合的布局组件；能够通过现有组件清晰实现时，优先使用 Ant Design，不重复编写自定义布局代码
- 页面整体结构优先考虑 `Layout`、`Layout.Header`、`Layout.Sider`、`Layout.Content`；响应式栅格优先使用 `Row`、`Col`；一维排列和对齐优先使用 `Flex`；简单元素间距优先使用 `Space`
- 分栏、等宽列、多行自适应和不同断点下的列宽变化，应优先通过 `Row` 的 `gutter`、`align`、`justify`、`wrap` 以及 `Col` 的 `span`、`xs`、`sm`、`md`、`lg`、`xl`、`xxl` 属性实现
- 需要根据当前断点切换组件属性、内容或交互方式时，优先使用 Ant Design `Grid.useBreakpoint`，不要在 JavaScript 中自行监听和计算窗口宽度
- 同级元素的方向、对齐、分布、换行和间距可由 `Flex`、`Space` 或 `Row` 完成时，不要在 SCSS 中重复编写 `display: flex`、`gap`、`justify-content`、`align-items` 等布局规则
- 组件属性负责页面结构、响应式、尺寸分配、间距和对齐；SCSS 主要负责颜色、背景、字体、边框、圆角、阴影、状态、伪元素、动画和 Ant Design 无法直接表达的复杂视觉规则
- 同一个布局区域应采用一致的布局体系，避免同时使用 Ant Design 栅格、自定义 CSS Grid、绝对定位和多套宽度计算相互修正
- 不应为了使用布局组件而增加无意义的嵌套。普通文本、标题、语义分区等静态结构继续使用合适的原生语义标签；Ant Design 组件不能改善布局表达或会降低可读性时，可使用简洁的 SCSS 布局
- 调整布局时应优先修改组件的布局属性和响应式断点，避免使用负边距、魔法数字、固定像素偏移或绝对定位进行补偿

## 查询筛选表单布局规范

列表页顶部的查询、筛选表单默认采用统一的 Ant Design `Form`、`Row`、`Col` 栅格布局。除非页面存在明确的特殊交互或字段数量要求，否则应遵循以下规范。

### 组件与结构

- 查询筛选区域应封装为页面 `components` 目录中的独立组件，页面组件只负责接收筛选结果并触发数据加载
- 表单使用 `layout="horizontal"` 和 `labelAlign="left"`，标签文字左对齐
- 表单设置 `labelCol={{ flex: 'none' }}`，标签区域不参与压缩
- 表单设置 `wrapperCol={{ flex: '1 1 0' }}`，控件占据当前列的剩余空间；不要使用 `flex: 'auto'`，避免不同长度的标签导致部分表单项单独换行
- 同一表单项中的标签和控件应保持一致的换行行为，默认均不换行；不得出现某个标签位于控件上方，而其他表单项仍保持水平排列的情况
- 查询、重置按钮必须使用 Ant Design `Button`，查询按钮设置 `type="primary"` 和 `htmlType="submit"`
- 重置时应先调用 `form.resetFields()`，再以空筛选条件重新触发查询，确保列表立即恢复为未筛选状态

### 栅格与响应式布局

- 表单的主要布局、列宽、间距和对齐统一由 `Row`、`Col` 负责，不使用 SCSS Grid、Flex 或固定宽度重复实现栅格布局
- 单行筛选表单外层使用 `<Row gutter={[24, 16]} align="middle">`，分别统一控制横向和纵向间距；适用于两个筛选项及一个操作按钮区域的简单场景
- 筛选项使用 `<Col xs={24} md={12} lg={8}>`：手机端单列、平板端两列、桌面端三等分
- 操作按钮区域使用 `<Col xs={24} lg={8}>`：小屏独占一行，桌面端占第三个等宽列
- 操作按钮区域内部继续使用 `<Row gutter={12} justify="end" wrap={false}>`，每个按钮放在独立 `Col` 中；按钮整体在所在列中靠右排列且按钮之间不换行
- 不应通过额外的 `margin`、固定宽度或绝对定位修正栅格位置；确需调整断点时，应优先修改 `Col` 的 `xs`、`md`、`lg`、`xl` 配置

### 多个筛选项的多行布局

- 当查询表单包含多个主要筛选项时，默认采用可扩展的多行结构，不将全部字段和操作按钮挤在同一行
- 桌面端 `lg` 及以上每行最多放置三个筛选项，每项使用 `<Col xs={24} md={12} lg={8}>`；字段超过三个时按相同规则继续增加行
- 查询、重置按钮始终放在全部筛选项之后，位于最后一行右侧，并通过 `<Row gutter={12} justify="end" wrap={false}>` 保持右对齐和不换行
- 操作区域在桌面端应占据最后一行的剩余栅格：最后一行有一个筛选项时使用 `lg={16}`，有两个筛选项时使用 `lg={8}`；筛选项总数恰好为三的倍数时，操作区域使用 `lg={24}` 单独占据下一行
- 平板端 `md` 每行最多放置两个筛选项，操作区域占据最后一行的剩余栅格；手机端 `xs` 为单列，操作按钮独占一行并保持右对齐
- 筛选项数量固定时可直接设置操作区域的 `md`、`lg` 跨度；筛选项由配置动态生成时，可根据字段数量计算剩余栅格，但不得通过监听或计算窗口宽度决定布局
- 新增、导出等列表级操作不放入查询表单，应通过 `DataTablePanel` 的 `toolbar` 插槽展示
- 人员管理页面 `src/pages/personnel-list/components/personnel-filter.tsx` 是多筛选项布局的参考实现

推荐结构：

```tsx
<Form
  form={form}
  layout="horizontal"
  labelAlign="left"
  labelCol={{ flex: 'none' }}
  wrapperCol={{ flex: '1 1 0' }}
  onFinish={onSearch}
>
  <Row gutter={[24, 16]} align="middle">
    {filterFields.map((field) => (
      <Col key={field.name} xs={24} md={12} lg={8}>
        <Form.Item name={field.name} label={field.label}>
          {field.control}
        </Form.Item>
      </Col>
    ))}

    <Col xs={24} md={tabletActionSpan} lg={desktopActionSpan}>
      <Row gutter={12} justify="end" wrap={false}>
        <Col>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Col>
        <Col>
          <Button onClick={handleReset}>重置</Button>
        </Col>
      </Row>
    </Col>
  </Row>
</Form>
```

动态筛选项可按以下方式计算操作区域跨度；固定字段页面可直接填写计算后的值，保持 JSX 更直观：

```ts
const desktopRemainder = filterFields.length % 3
const tabletRemainder = filterFields.length % 2
const desktopActionSpan = desktopRemainder === 0 ? 24 : (3 - desktopRemainder) * 8
const tabletActionSpan = tabletRemainder === 0 ? 24 : 12
```

### 标签文案与样式职责

- 同一查询表单内长度不同的标签文案应使用统一的文字包装元素，并采用两端对齐，使较短文案在与最长常规标签相同的文字区域内均匀分布
- 标签文字区域使用相对字号单位 `em`，按当前表单最长常规标签的汉字数量设置，例如四个汉字使用 `inline-size: 4em`；不要给 `labelCol` 设置固定像素宽度
- 标签文字应设置 `white-space: nowrap`，避免文字内部断行
- 表单卡片的背景、边框、圆角、阴影、文字颜色和字重由 SCSS 负责；`Form.Item` 在筛选卡片内默认取消底部外边距
- SCSS 不负责表单主结构、响应式列宽、字段间距或按钮对齐

推荐样式：

```scss
.page-filter-panel {
  .ant-form-item {
    margin: 0;
  }

  .ant-form-item-label label {
    color: #273755;
    font-size: 14px;
    font-weight: 600;
  }
}

.page-filter-label {
  display: inline-block;
  inline-size: 4em;
  text-align: justify;
  text-align-last: justify;
  white-space: nowrap;
}
```

## 列表页滚动表格规范

- 需要让表格占据页面剩余高度、表体内部滚动且分页器始终位于视口内时，统一使用 `src/components/data-table-panel` 提供的公共组件，不要在业务页面重复实现高度计算和滚动结构
- 页面根布局使用 `DataTablePageLayout`，筛选区域和表格面板作为其直接子元素；该布局负责列表页满高、纵向间距和阻止页面级滚动
- 表格区域使用泛型组件 `DataTablePanel<RecordType>`，通过 `tableProps` 传入 `rowKey`、`columns`、`dataSource`、`loading` 等 Ant Design Table 业务属性
- 页面工具栏通过 `toolbar` 插槽传入，错误或状态提示通过 `feedback` 插槽传入；公共组件负责统一它们与表格、分页器之间的位置和间距
- 横向滚动宽度通过 `scrollX` 配置；表体纵向滚动高度由公共组件内部的 `ResizeObserver` 自动计算，业务页面不得自行设置 `scroll.y`
- 分页状态通过 `pagination` 传入。公共组件使用独立的 Ant Design `Pagination` 固定在面板底部，并在切换每页条数时统一回到第一页；默认每页条数及可选项使用 `20`、`50`、`100`
- 业务页面继续负责列定义、单元格渲染、权限判断、路由跳转和数据请求，不应把具体业务规则下沉到公共表格组件
- 企业管理页面是该模式的参考实现；新增相似列表页面时应复用公共组件，而不是复制 `useTableScrollHeight` 或依赖 Ant Design 表格内部 DOM 结构

## 异步接口调用规范

- 调用异步接口时默认使用 `async/await` 配合 `try...catch` 处理成功与异常流程，不使用 `.then().catch()` 链式调用
- 存在加载状态收尾逻辑时，使用 `finally` 统一恢复状态
- 接口异常已由统一 HTTP 层展示时，业务层的 `catch` 仅处理必要的本地状态，不重复展示相同错误
