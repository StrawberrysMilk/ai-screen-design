<script setup lang="ts">
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'
defineOptions({
  name: 'MessageList',
})
const props = defineProps(['messages', 'isLoading'])

const visibleMessages = computed(() => {
  const lastIndex = props.messages.length - 1
  return props.messages.filter((item, index) => {
    return item.text || (lastIndex === index && props.isLoading)
  })
})

let isScroll = true
const messageListRef = useTemplateRef('messageList')
const messageContainerRef = useTemplateRef('messageContainer')

const showAiLoading = computed(() => {
  if (!props.isLoading) return false
  return props.messages.at(-1)?.type !== 'ai'
})

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    const el = messageContainerRef.value
    if (!isScroll || !el) return
    el.scrollTop = el.scrollHeight
  })

  resizeObserver.observe(messageListRef.value)
})

function onScroll() {
  const el = messageContainerRef.value
  isScroll = el.scrollHeight - el.scrollTop - el.clientHeight <= 30
}
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
            v-if="message.text"
            :render-code-blocks-as-pre="false"
            :code-block-props="{ showCopyButton: true }"
            :content="message.text"
            mode="chat"
            html-policy="escape"
            :final="true"
          />
          <span v-else class="typing">...</span>
        </div>
      </div>

      <div v-if="showAiLoading" class="message-box message-box-ai flex gap-10">
        <el-avatar :size="28">AI</el-avatar>
        <div class="message-content">
          <span class="typing">...</span>
        </div>
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
