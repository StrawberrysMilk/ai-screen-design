<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import type { MaterialEvent } from '@/schema/material.ts'
import MonacoEditor from '@/components/MonacoEditor/index.vue'

defineOptions({
  name: 'NodeEvents',
})

const editorStore = useEditorStore()
const { selectedNode, nodes } = storeToRefs(editorStore)

/**
 * 深拷贝事件列表
 */
const data = ref(deepClone(selectedNode.value.events) || [])

const dispatchEvent = ref()

const dispatchOptions = computed(() => {
  return nodes.value.map((node) => {
    return {
      label: node.name,
      value: node.id,
      children: node.events?.map((e) => {
        return {
          label: e.title,
          value: e.name,
        }
      }),
    }
  })
})

const activeEvent = ref()
function selectEvent(event: MaterialEvent) {
  activeEvent.value = event
}

/**
 * 新增数据源
 */
function onAdd() {
  const newSource: MaterialEvent = {
    title: '自定义',
    name: '', // 函数名
    type: '',
    data: '',
    code: '',
  }
  data.value.push(newSource)
  selectEvent(newSource)
}

/**
 * 删除数据源
 * @param name
 */
function removeDataEvent(name: string) {
  const index = data.value.findIndex((item) => item.name === name)
  if (index !== -1) {
    data.value.splice(index, 1)
    if (activeEvent.value?.name === name) {
      selectEvent(null)
    }
  }
}

async function copyNodeId(id: string) {
  /**
   * 只支持 https 或者开发环境
   */
  await navigator.clipboard.writeText(id)
  ElMessage.success('复制成功')
}

function insertDispatch(values: string[]) {
  const [id, name] = values
  const code = `\n$context.dispatch('${id}', '${name}')`

  activeEvent.value.code += code

  nextTick(() => {
    dispatchEvent.value = undefined
  })
}

defineExpose({
  save() {
    // 更新节点 事件
    editorStore.updateNode(selectedNode.value.id, {
      ...selectedNode.value,
      events: data.value,
    })
  },
})
</script>

<template>
  <div class="node-event-container">
    <div class="node-event-sidebar">
      <el-button @click="onAdd" type="primary" size="small">新增</el-button>
      <div
        class="node-event-item"
        v-for="item in data"
        :class="{ active: item.name === activeEvent?.name }"
        :key="item.name"
        @click="selectEvent(item)"
      >
        <!--    左侧栏显示标题    -->
        <span>{{ item.title }}</span>
        <span @click.stop="removeDataEvent(item.name)"><Icon icon="mdi:delete" color="red" /></span>
      </div>
    </div>
    <div class="node-event-content">
      <el-form v-if="activeEvent">
        <div class="flex gap-20 mb-20">
          <el-select class="flex-1" placeholder="复制节点 ID" @change="copyNodeId">
            <el-option v-for="node in nodes" :key="node.id" :value="node.id">{{
              node.name
            }}</el-option>
          </el-select>

          <el-cascader
            class="flex-1"
            placeholder="触发事件"
            :options="dispatchOptions"
            v-model="dispatchEvent"
            @change="insertDispatch"
          ></el-cascader>
        </div>
        <el-form-item label="标题">
          <el-input v-model="activeEvent.title"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="activeEvent.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="activeEvent.type" />
        </el-form-item>
        <el-form-item label="函数体">
          <div class="function-content flex flex-col w-full bg-[#1e1e1e]">
            <div class="flex-none pl-30">
              function {{ activeEvent.name }}($context, $node, $payload){
            </div>
            <monaco-editor class="flex-1" v-model="activeEvent.code" lang="javascript" />
            <div class="flex-none pl-30">}</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.node-event-container {
  display: flex;
  gap: 20px;
  height: 600px;
  .node-event-sidebar {
    width: 200px;
    flex: none;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
    .node-event-item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding: 0 10px;
      cursor: pointer;
      background: bg-mix(20);
      &.active {
        background: var(--el-color-primary);
      }
    }
  }
  .node-event-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
    .function-content {
      font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
    }
  }
}
</style>
