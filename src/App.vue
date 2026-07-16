<script setup lang="ts">
import ScreenEditor from '@/editor/index.vue'
/**
 * 1. 备忘录模式： 存快照，深拷贝，缺点：比较浪费空间
 * 2. 命令模式：保存的修改的基础数据 =》 { target, key, oldValue, newValue }，缺点：需要自己维护数据结构
 */
</script>

<template>
  <div>
    <ScreenEditor />
  </div>
</template>

<style scoped lang="scss"></style>
