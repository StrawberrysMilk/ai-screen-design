<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
defineOptions({
  name: 'ToolbarLeft',
})

const { panelVisible } = useEditorStore()
</script>

<template>
  <div class="flex gap-20 toolbar-left">
    <span
      :class="{ active: panelVisible.material }"
      @click="panelVisible.material = !panelVisible.material"
    >
      <Icon icon="fluent:panel-left-28-filled" />
    </span>
    <span
      :class="{ active: panelVisible.property }"
      @click="panelVisible.property = !panelVisible.property"
    >
      <Icon icon="fluent:panel-right-28-filled" />
    </span>
    <span :class="{ active: panelVisible.layer }" @click="panelVisible.layer = !panelVisible.layer">
      <Icon icon="fluent:layer-20-filled" />
    </span>
    <span>
      <Icon icon="ic:baseline-undo" />
    </span>
    <span>
      <Icon icon="ic:baseline-redo" />
    </span>
  </div>
</template>

<style scoped lang="scss">
.toolbar-left {
  span {
    border: 1px solid #3b465b;
    border-radius: 4px;
    cursor: pointer;

    &.active {
      background: #445f69;
    }
  }
}
</style>
