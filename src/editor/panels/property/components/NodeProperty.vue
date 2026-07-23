<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { getMaterialSetters } from '@/materials'
import FormCreate from '@/editor/panels/property/components/FormCreate.vue'
import { Icon } from '@iconify/vue'
import DataSource from '@/editor/panels/property/components/DatatSource.vue'

defineOptions({
  name: 'NodeProperty',
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)
const setters = computed(() => {
  return getMaterialSetters(selectedNode.value?.type || '')
})

const layoutSetters = [
  {
    label: '宽度',
    key: 'layout.width',
    type: 'number',
    span: 12,
  },
  {
    label: '高度',
    key: 'layout.height',
    type: 'number',
    span: 12,
  },
  {
    label: 'x',
    key: 'layout.x',
    type: 'number',
    span: 12,
  },
  {
    label: 'y',
    key: 'layout.y',
    type: 'number',
    span: 12,
  },
]

const activeTab = ref('property')
const active = ref('node')

const visible = ref(false)
const jsonText = ref<string>('')

function previewJson() {
  visible.value = true
  jsonText.value = JSON.stringify(selectedNode.value, null, 2)
}

function onConfirm() {
  // 拿到新节点
  const newNode = JSON.parse(jsonText.value)
  // 更新节点
  editorStore.updateNode(selectedNode.value.id, {
    ...newNode,
    // id type 不能改，沿用之前的
    id: selectedNode.value.id,
    type: selectedNode.value.type,
  })
  visible.value = false
}
</script>

<template>
  <div class="node-property">
    <div
      class="node-title h-40 flex items-center px-20 justify-between font-semibold cursor-pointer"
    >
      <span>
        {{ selectedNode?.name || '未选择组件' }}
      </span>
      <span class="cursor-pointer" @click="previewJson">
        <Icon icon="si:json-duotone" />
      </span>
    </div>
    <el-tabs v-model="activeTab" stretch>
      <el-tab-pane label="属性" name="property">
        <el-collapse v-model="active" accordion>
          <el-collapse-item :title="'布局属性'" name="layout">
            <form-create :setters="layoutSetters" :form-data="selectedNode" />
          </el-collapse-item>
          <el-collapse-item :title="'组件属性'" name="node">
            <form-create :setters="setters" :form-data="selectedNode" />
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="data-source">
        <DataSource />
      </el-tab-pane>
    </el-tabs>
    <el-drawer :destroy-on-close="true" v-model="visible" title="编辑 JSON" size="800">
      <MonacoEditor v-model="jsonText" />
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.node-property {
  .node-title {
    background: bg-mix(60);
  }
  :deep(.el-collapse) {
    --el-collapse-border-color: var(--border-color);
    --el-collapse-header-height: 48px;
    --el-collapse-header-bg-color: transparent;
    --el-collapse-header-text-color: var(--el-text-color-primary);
    --el-collapse-header-font-size: 13px;
    --el-collapse-content-bg-color: transparent;
    --el-collapse-content-font-size: 13px;
    --el-collapse-content-text-color: var(--el-text-color-primary);
    border-top: 1px solid var(--el-collapse-border-color);
    border-bottom: 1px solid var(--el-collapse-border-color);
    .el-collapse-item__title {
      padding-left: 20px !important;
    }
  }
}
</style>
