<script setup lang="ts">
defineOptions({
  name: 'materialItem',
})

const props = defineProps(['material'])

function onStart(e: DragEvent) {
  e.dataTransfer.setData('schema', JSON.stringify(props.material.schema))
}
</script>

<template>
  <div class="material-item" draggable="true" @dragstart="onStart">
    <div class="title">{{ material.name }}</div>
    <div class="icon">
      <Icon :icon="material.icon" width="80" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-item {
  cursor: pointer;
  height: 120px;
  padding: 10px;
  background: bg-mix(40);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  .title {
    height: 26px;
    font-size: 12px;
    font-weight: 700;
  }
  .icon {
    flex: 1;
    display: flex;
    justify-content: center;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
  &:hover {
    transform: translateY(-2px);
    --border-color: #5e8382;
  }
}
</style>
