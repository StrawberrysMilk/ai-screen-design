# 2026-07-25 代码整理笔记

> 对应课程：第 26 节「API数据源」

## 今日改动文件

- `package.json`
- `pnpm-lock.yaml`
- `src/mock/data.ts`
- `src/composables/useDataSource.ts`
- `src/main.ts`
- `src/materials/charts/component.vue`
- `src/schema/page.ts`
- `src/stores/editor.ts`
- `src/editor/panels/property/components/FormCreate.vue`
- `src/editor/panels/property/components/NodeProperty.vue`

## 本次代码目标

这次代码主要围绕“数据源驱动图表”展开：

1. 在页面 schema 中加入 `dataSources`，让页面可以保存多个数据源配置。
2. 在 store 中初始化默认数据源，包括静态数据源和 API 数据源。
3. 新增 mock 接口 `/api/data`，用于模拟后端返回图表数据。
4. 新增 `useDataSource` 组合式函数，统一处理静态数据、接口请求、轮询刷新和页面查询参数透传。
5. 图表物料从绑定的数据源读取数据，并覆盖 ECharts 的 `dataset.source`。
6. 属性面板支持表单化修改节点属性，并增加数据源页签和 JSON 编辑入口。

## 依赖变化

`package.json` 新增了和数据请求、mock 相关的依赖：

- `axios`：用于在 `useDataSource` 中发起 API 请求。
- `mockjs`：用于在本地开发时拦截接口并生成模拟数据。
- `@types/mockjs`：提供 MockJS 的 TypeScript 类型声明。

`pnpm-lock.yaml` 随依赖安装同步更新。

## 数据源 Schema

文件：`src/schema/page.ts`

新增 `DataSourceSchema`，用于描述页面中的数据源：

- `id`：数据源唯一标识，节点通过这个字段绑定数据源。
- `name`：数据源名称，用于属性面板展示。
- `type`：数据源类型，目前支持 `static` 和 `api`。
- `data`：静态数据内容，或 API 数据源的默认占位数据。
- `url`：API 数据源的请求地址。
- `interval`：API 数据源轮询间隔，单位毫秒。
- `params`：API 请求默认参数。

`PageSchema` 也从原来的 `canvas + nodes` 扩展为：

```ts
export interface PageSchema {
  canvas: CanvasSchema
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
```

这样页面数据结构就可以同时保存画布、节点和数据源。

## Store 中的数据组织

文件：`src/stores/editor.ts`

`page` 中新增了 `dataSources` 默认数据：

- `id: '123'`：静态数据源，包含一月、二月、三月数据。
- `id: '456'`：另一个静态数据源，模拟访问数据。
- `id: '568'`：API 数据源，请求 `/api/data`，每 2 秒轮询一次。

store 里通过 `toRef` 从 `page.value` 中拆出：

```ts
const canvas = toRef(page.value, 'canvas')
const nodes = toRef(page.value, 'nodes')
const dataSources = toRef(page.value, 'dataSources')
```

这样编辑器其他模块可以直接使用 `canvas`、`nodes`、`dataSources`，同时它们仍然属于同一个页面模型。

新增或相关方法：

- `setPage(newPage)`：合并外部传入的页面配置。
- `updateNode(id, newNode)`：根据节点 id 替换节点，用于 JSON 编辑后更新节点。
- `dataSources`：返回给外部使用，方便通过 provide/inject 或组件直接读取。

## Mock 数据接口

文件：`src/mock/data.ts`

通过 MockJS 拦截：

```ts
Mock.mock(/\/api\/data/, 'get', handler)
```

请求 `/api/data` 时，会读取 URL 查询参数中的 `date`，并返回 6 条数据：

```ts
[
  { label: '一月', value: 100-1000, date },
  ...
]
```

这个 mock 的作用是模拟后端接口，配合 API 数据源验证图表动态更新。

文件：`src/main.ts`

入口文件中加入：

```ts
import '@/mock/data.ts'
```

这行代码让 mock 逻辑在应用启动时生效。

## useDataSource 逻辑

文件：`src/composables/useDataSource.ts`

`useDataSource(dataId)` 的职责是：根据节点绑定的 `dataId` 找到对应数据源，并返回响应式数据。

核心流程：

1. 通过 `inject<Ref<DataSourceSchema[]>>('dataSources')` 获取页面数据源列表。
2. 根据 `dataId.value` 找到当前数据源。
3. 如果是 `static`，直接使用 `source.data`。
4. 如果是 `api`，使用 `axios.get(source.url)` 请求数据。
5. 请求时会合并两类参数：
   - 数据源自身的 `source.params`
   - 当前浏览器地址栏上的查询参数 `location.search`
6. 如果 API 数据源配置了 `interval`，请求完成后用 `setTimeout` 再次拉取。
7. 组件卸载时通过 `clearTimeout(timer)` 清理轮询。

这使得图表既可以用静态数据，也可以绑定接口数据，并且支持按页面 URL 参数动态变化。

## 图表组件如何消费数据

文件：`src/materials/charts/component.vue`

图表组件读取当前节点 schema：

```ts
const dataId = computed(() => props.schema.dataId)
const { data } = useDataSource(dataId)
```

然后计算最终 ECharts 配置：

```ts
const option = computed(() => {
  const _option = props.schema.props.option
  return {
    ..._option,
    dataset: {
      ..._option.dataset,
      source: data.value || _option.dataset.source,
    },
  }
})
```

这里的关键点是：

- 节点自身仍然保存默认的 ECharts option。
- 如果绑定的数据源返回了数据，就用数据源覆盖 `dataset.source`。
- 如果没有数据源数据，就回退到 option 里原本的 `dataset.source`。

组件挂载时初始化 ECharts：

```ts
chart = init(chartRef.value)
chart.setOption(option.value)
```

并监听 `option`：

```ts
watch(option, (newVal) => {
  chart.setOption(newVal)
}, { deep: true })
```

这样数据源刷新、节点属性修改、图表配置变化都会触发图表重新渲染。

同时组件使用 `ResizeObserver` 监听 DOM 尺寸变化，自动调用 `chart.resize()`，避免画布尺寸变化后图表显示异常。

## 属性表单生成逻辑

文件：`src/editor/panels/property/components/FormCreate.vue`

`FormCreate` 是一个根据 `setters` 动态生成表单的组件。

当前支持的控件类型：

- `input`：文本输入
- `number`：数字输入
- `select`：选择器
- `checkbox`：复选框
- `color`：颜色选择器

字段读写依赖 `src/utils/index.ts` 中的路径工具：

- `getValue(formData, item.key)`：读取嵌套字段，如 `layout.width`
- `applyChange(formData, item.key, val)`：通过撤销重做系统写入字段

表单控件聚焦和失焦时调用：

- `startBatch`
- `commitBatch`

这样连续输入可以被合并成一次撤销记录，交互体验更自然。

## 节点属性面板逻辑

文件：`src/editor/panels/property/components/NodeProperty.vue`

节点属性面板现在分为两个页签：

- `属性`：展示布局属性和组件自身属性。
- `数据源`：展示数据源配置组件。

布局属性固定包含：

- 宽度：`layout.width`
- 高度：`layout.height`
- x：`layout.x`
- y：`layout.y`

组件属性来自物料定义：

```ts
const setters = computed(() => {
  return getMaterialSetters(selectedNode.value?.type || '')
})
```

也就是说，每种物料可以通过自己的 setters 决定属性面板展示哪些配置项。

面板右上角新增 JSON 编辑入口：

1. 点击图标后，把当前选中节点序列化成 JSON。
2. 使用 `MonacoEditor` 在抽屉里编辑。
3. 点击确认后 `JSON.parse` 成新节点。
4. 调用 `editorStore.updateNode` 替换节点。
5. 为了避免破坏节点身份，保留原来的 `id` 和 `type`。

## 整体数据流

```text
页面启动
  -> main.ts 引入 mock/data.ts
  -> MockJS 拦截 /api/data

编辑器 store 初始化
  -> page.canvas
  -> page.nodes
  -> page.dataSources

节点绑定 dataId
  -> 图表组件读取 schema.dataId
  -> useDataSource 找到对应数据源

如果数据源是 static
  -> 直接返回 source.data

如果数据源是 api
  -> axios 请求 source.url
  -> 合并 source.params 和 location.search
  -> 写入 data
  -> interval 存在时继续轮询

图表组件监听 option
  -> 用 data 覆盖 dataset.source
  -> chart.setOption
  -> 图表刷新
```

## 当前需要注意的点

1. `useDataSource` 依赖 `inject('dataSources')`，使用图表组件的上层必须提供这个数据，否则 `dataSources.value` 会报错。
2. API 数据源轮询使用 `setTimeout`，组件卸载时已经清理 timer，但如果频繁切换数据源，后续可以考虑先清理旧 timer 再重新请求。
3. `NodeProperty` 的 JSON 编辑目前直接 `JSON.parse`，如果输入非法 JSON 会抛错，后续可以加错误提示。
4. `chart.setOption(newVal)` 在 `chart` 初始化前理论上可能被 watch 触发，后续可以加 `if (!chart) return` 保护。
5. `package.json` 中新增 `@types/mockjs` 放在 dependencies，后续可以考虑移动到 devDependencies。

## 一句话总结

这批代码把“页面数据源”接入到了图表物料中：页面维护数据源，节点通过 `dataId` 绑定数据源，`useDataSource` 负责取数和轮询，图表组件把数据源结果注入 ECharts 的 `dataset.source`，从而实现静态数据和接口数据驱动的图表渲染。
