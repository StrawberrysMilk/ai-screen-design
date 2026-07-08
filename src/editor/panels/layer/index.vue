<script setup lang="ts">
defineOptions({
  name: 'LayerPanel',
})
</script>

<template>
  <div class="h-full">
    <div class="h-full layer-panel p-[10px] overflow-auto">
      <div
        class="flex justify-between items-center px-[10px] h-[30px] border-b border-[var(--border-color)] text-[12px] rounded-[4px] cursor-pointer mt-[4px]"
        v-for="item in 40"
        :key="item"
      >
        <span>柱状图</span>
        <span><Icon icon="fluent:list-bar-24-filled" /></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  background: bg-mix(50);
  & > div {
    background: bg-mix(30);
    &.active {
      background: #0e8da7;
    }
  }
}
</style>
