<script setup lang="ts">
defineOptions({
  name: 'ChartsMaterial',
})
defineProps(['schema'])
</script>

<template>
  <div>
    {{ schema.props.option }}
  </div>
</template>

<style scoped lang="scss"></style>
