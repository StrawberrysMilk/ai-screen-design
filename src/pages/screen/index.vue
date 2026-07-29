<script setup lang="ts">
import { getPublishedPage } from '@/utils/publish.ts'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'ScreenPage',
})
const route = useRoute()
/**
 * 点击预览，从 getPublishedPage 中获取当前页面的json数据，传给ScreenRenderer组件进行渲染
 */
const rawId = route.query.id
const pageId = Array.isArray(rawId) ? rawId[0] : rawId

if (!pageId) {
  throw new Error('缺少页面 ID')
}

const page = getPublishedPage(pageId)
</script>

<template>
  <ScreenRenderer :page="page" />
</template>

<style scoped lang="scss"></style>
