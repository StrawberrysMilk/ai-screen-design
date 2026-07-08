<script setup lang="ts">
import ToolbarLeft from '@/editor/toolbar/ToolbarLeft.vue'
import ToolbarRight from '@/editor/toolbar/ToolbarRight.vue'
import { useEditorStore } from '@/stores/editor.ts'
import MaterialPanel from '@/editor/panels/material/index.vue'
import LayerPanel from '@/editor/panels/layer/index.vue'

defineOptions({
  name: 'ScreenEditor',
})
const editorStore = useEditorStore()

const materialWidth = computed(() => (editorStore.panelVisible.material ? '260px' : '0'))
const layerWidth = computed(() => (editorStore.panelVisible.layer ? '160px' : '0'))
const propertyWidth = computed(() => (editorStore.panelVisible.property ? '260px' : '0'))
</script>

<template>
  <div class="editor h-screen">
    <header class="header h-56 flex items-center px-20">
      <ToolbarLeft class="w-300" />
      <div class="flex-1 text-center">标题</div>
      <ToolbarRight class="w-300" />
    </header>
    <main class="h-[calc(100%-56px)] flex">
      <!--      物料      -->
      <MaterialPanel class="material transition-all" :style="{ width: materialWidth }" />
      <!--      图层      -->
      <LayerPanel class="layer overflow-hidden transition-all" :style="{ width: layerWidth }" />
      <!--      画布      -->
      <div class="canvas flex-1">画布</div>
      <!--      属性      -->
      <aside class="property overflow-hidden transition-all" :style="{ width: propertyWidth }">
        属性
      </aside>
    </main>
  </div>
</template>

<style scoped lang="scss">
.editor {
  background: var(--bg-color);
  .header {
    border-bottom: 1px solid var(--border-color);
  }

  .material， .layer {
    border-right: 1px solid var(--border-color);
  }
  .property {
    border-left: 1px solid var(--border-color);
  }
}
</style>
