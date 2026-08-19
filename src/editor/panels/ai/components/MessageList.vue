<script setup lang="ts">
defineOptions({
  name: 'MessageList',
})
defineProps(['messages'])
</script>

<template>
  <div class="message-container flex flex-col gap-10 overflow-auto -m-20 p-20">
    <div
      v-for="message in messages"
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
        <span v-if="message.text"> {{ message.text }}</span>
        <span v-else class="typing">...</span>
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
