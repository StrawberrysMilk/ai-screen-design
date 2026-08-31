<script setup lang="ts">
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'

interface ChatMessage {
  id?: string
  type?: string
  text?: string
  content?: string | Array<{ type?: string; text?: string; content?: string }>
}

const props = defineProps<{
  messages: ChatMessage[]
  isLoading?: boolean
}>()

function getMessageText(message: ChatMessage) {
  if (typeof message.text === 'string') return message.text
  if (typeof message.content === 'string') return message.content
  if (Array.isArray(message.content)) {
    return message.content.map((block) => block.text ?? block.content ?? '').join('')
  }
  return ''
}

function hasPendingAssistantMessage() {
  const lastMessage = props.messages.at(-1)
  // An empty AI message already renders the inline `v-else` placeholder.
  return props.isLoading && (!lastMessage || lastMessage.type !== 'ai')
}

defineOptions({
  name: 'MessageList',
})

const messageListRef = useTemplateRef('messageList')
const messageContainerRef = useTemplateRef('messageContainer')

const visibleMessages = computed(() => {
  const lastIndex = props.messages.length - 1
  return props.messages.filter((item, index) => {
    return item.text || (lastIndex === index && props.isLoading)
  })
})

let isScroll = true

function scrollBottom() {
  const container = messageContainerRef.value
  if (!container) return
  container.scrollTop = container.scrollHeight
}

function onScroll() {
  const container = messageContainerRef.value
  if (!container) return
  isScroll = container.scrollHeight - container.scrollTop - container.clientHeight <= 50
}

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    if (isScroll) {
      scrollBottom()
    }
  })
  if (messageListRef.value) {
    resizeObserver.observe(messageListRef.value)
  }
  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})
</script>

<template>
  <div
    ref="messageContainer"
    class="h-full message-container overflow-auto -m-20 p-20"
    @scroll="onScroll"
  >
    <div ref="messageList" class="flex flex-col gap-10 py-10">
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="message-box flex gap-10"
        :class="`message-box-${message.type}`"
      >
        <!--   头像   -->
        <el-avatar :size="28">
          {{ message.type === 'ai' ? 'AI' : '我' }}
        </el-avatar>
        <!--   消息内容   -->
        <div class="message-content">
          <MarkdownRender
            v-if="getMessageText(message)"
            :render-code-blocks-as-pre="false"
            :code-blocks-props="{ showCopyButtons: true }"
            :content="getMessageText(message)"
            mode="chat"
            html-policy="escape"
            :final="true"
          />
          <span v-else class="typing">...</span>
        </div>
      </div>
    </div>

    <div v-if="hasPendingAssistantMessage()" class="message-box message-box-ai flex gap-10 py-10">
      <el-avatar :size="28">AI</el-avatar>
      <div class="message-content">
        <span class="typing">...</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-box {
  .message-content {
    max-width: 85%;
    background: #1b3039;
    padding: 8px 10px;
    border-radius: 4px 12px 12px 12px;
  }
  &-human {
    flex-direction: row-reverse;
    .message-content {
      border-radius: 12px 4px 12px 12px;
    }
  }
  .typing {
    animation: typing-animation 1s infinite;
  }
  @keyframes typing-animation {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
}
</style>
