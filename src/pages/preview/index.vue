<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'ScreenPreview',
})

/**
 * 点击预览，从 editorStore 中获取当前页面的json数据，传给ScreenRenderer组件进行渲染
 */
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)
</script>

<template>
  <ScreenRenderer :page="page" />
</template>

<style scoped lang="scss"></style>
