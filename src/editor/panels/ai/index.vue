<script setup lang="ts">
import MessageList from './components/MessageList.vue'
import { useStream } from '@langchain/vue'
import { getThreadId, setThreadId, deleteThreadId } from '@/editor/panels/ai/thread-storage.ts'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor.ts'
import { getAllMaterialSchema } from '@/materials'
import { CanvasSchema, DataSourceSchema } from '@/editor/schema/common.ts'
import { deepClone } from '@/utils'
import { toJSONSchema } from '@/utils/agent-schema.ts'
import { SCHEMA_VERSION } from '@/schema/version.ts'
import contextTypes from '@/runtime/context-types.ts?raw'

console.log('contextTypes ==> ', contextTypes)
defineOptions({
  name: 'AiPanel',
})
const message = ref('')

const editorStore = useEditorStore()
const { page, selectedNodeIds } = storeToRefs(editorStore)
const activeRunId = ref<string>(null)
const { messages, submit, isLoading, stop, client, values } = useStream({
  apiUrl: 'http://localhost:2024',
  assistantId: 'screen_design_agent',
  transport: 'sse',
  threadId: getThreadId(),
  onThreadId: setThreadId,
  onCreated({ runId }) {
    activeRunId.value = runId
  },
})

const editPlan = computed(() => values.value.editPlan as any)

const showStep = ref(false)
watch(editPlan, (value) => {
  showStep.value = !!value.length
})
const methodMap = {
  add_node: 'addNode',
  update_node: 'updateNode',
  remove_node: 'removeNode',
  add_data_source: 'addDataSource',
  update_data_source: 'updateDataSource',
}

watch(
  () => values.value.actions,
  (actions: any) => {
    if (!actions.length) return
    for (const action of actions) {
      const node = deepClone(toRaw(action.node))
      const method = methodMap[action.type]
      editorStore[method](node)
    }
  },
)

function onSubmit() {
  if (isLoading.value || !message.value) return
  showStep.value = false
  // @ts-ignore
  const version = values.value.schema?.version
  const requestBody: Record<string, any> = {}
  if (version !== SCHEMA_VERSION) {
    requestBody.schema = {
      version: SCHEMA_VERSION,
      material: getAllMaterialSchema(),
      canvas: toJSONSchema(CanvasSchema),
      dataSource: toJSONSchema(DataSourceSchema),
      contextTypes,
    }
  }
  submit({
    messages: [
      {
        type: 'human',
        content: message.value,
      },
    ],
    page: page.value,
    selectedNodeIds: selectedNodeIds.value,
    dataSources: editorStore.dataSources,
    ...requestBody,
  })
  message.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  onSubmit()
}

async function onStop() {
  await client.runs.cancel(getThreadId(), activeRunId.value, true, 'rollback')
  stop()
}

async function onDelete() {
  const id = getThreadId()
  deleteThreadId()
  await client.threads.delete(id)
  location.reload()
}
</script>

<template>
  <div class="ai-panel h-full select-text">
    <div class="p-20 h-full flex flex-col">
      <span class="cursor-pointer translate-z-1" @click="onDelete">
        <Icon icon="ant-design:delete-outlined"></Icon>
      </span>
      <MessageList
        class="message-list flex-1"
        :messages="messages"
        :isLoading="isLoading"
      ></MessageList>
      <el-collapse v-if="showStep">
        <el-collapse-item>
          <template #title>
            <div class="pl-20">任务进度</div>
          </template>
          <el-steps
            class="pl-20"
            direction="vertical"
            :active="values.currentTaskIndex"
            finishStatus="success"
            :space="40"
          >
            <el-step v-for="(task, index) in editPlan" :key="index" :title="task.title"></el-step>
          </el-steps>
        </el-collapse-item>
      </el-collapse>
      <footer class="flex flex-col flex-none gap-10">
        <el-input type="textarea" :rows="4" v-model="message" @keydown.enter="onKeydown"></el-input>
        <el-button v-if="!isLoading" type="primary" @click="onSubmit">发送</el-button>
        <el-button v-else type="danger" @click="onStop">停止</el-button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel {
  background: bg-mix(40);
}
</style>
