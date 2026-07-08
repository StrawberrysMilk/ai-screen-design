<script setup lang="ts">
import MaterialItem from '@/editor/panels/material/components/materialItem.vue'
import { getMaterialsByGroup, getMaterialsGroupt } from '@/materials'

defineOptions({
  name: 'MaterialPanel',
})

const activeGroup = ref('info')

const groups = getMaterialsGroupt()

const currentMaterials = computed(() => {
  return getMaterialsByGroup(activeGroup.value)
})
</script>

<template>
  <div class="material-panel flex">
    <div class="nav w-50">
      <div
        :class="{ active: activeGroup === item.key }"
        v-for="item in groups"
        :key="item.key"
        @click="activeGroup = item.key"
      >
        <span><Icon :icon="item.icon" width="16" /></span>
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="material-list p-10 flex-1 overflow-auto">
      <materialItem
        class="mt-10"
        v-for="item in currentMaterials"
        :key="item.name"
        :material="item"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-panel {
  background: bg-mix(80);
  .nav {
    border-right: 1px solid var(--bg-color);
    div {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 50px;
      font-size: 12px;
      &.active {
        background: bg-mix(30);
      }
    }
  }
}
</style>
