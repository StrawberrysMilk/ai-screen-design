<script setup lang="ts">
import MessageList from './components/MessageList.vue'
import { useStream } from '@langchain/vue'
defineOptions({
  name: 'AiPanel',
})
const message = ref('')

// 替换掉我们原有的 messages 就ok 了
const { messages, submit, isLoading, stop } = useStream({
  apiUrl: 'http://localhost:2024', // 这里的 apiUrl 是你在 LangChain Cloud 上创建的助手的 API URL
  assistantId: 'screen_design_agent', // 这里的 assistantId 是你在 LangChain Cloud 上创建的助手的 ID
  // transport: 'websocket' // 你可以选择使用 websocket 或者 sse 作为传输方式，默认是 sse
})

// 处理键盘事件
function onKeydown(e: KeyboardEvent) {
  // 如果是 Shift 键或正在输入中文，则不处理
  if (e.shiftKey || e.isComposing) return
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSubmit()
  }
}

// 处理提交事件
function onSubmit() {
  // 如果消息为空或正在加载中，则不处理
  if (!message.value || isLoading.value) return
  submit({
    messages: [
      {
        type: 'human',
        content: message.value,
      },
    ],
  })
  message.value = ''
}

function onStop() {
  stop()
}

watch(messages, (value) => {
  console.log('value ===>', value)
  // 当 messages 更新时，滚动到底部
  // nextTick(() => {
  //   const container = document.querySelector('.message-container')
  //   if (container) {
  //     container.scrollTop = container.scrollHeight
  //   }
  // })
})
</script>

<template>
  <div class="ai-panel h-full">
    <div class="p-20 h-full flex flex-col">
      <MessageList class="message-list flex-1" :messages="messages" :is-loading="isLoading" />
      <footer class="flex flex-col flex-none gap-10">
        <el-input v-model="message" type="textarea" :rows="4" @keydown.enter="onKeydown" />
        <el-button v-if="!isLoading" type="primary" @click="onSubmit">发送</el-button>
        <el-button v-else type="danger" @click="onStop">停止</el-button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel {
  background: bg-mix(60);
}
</style>
