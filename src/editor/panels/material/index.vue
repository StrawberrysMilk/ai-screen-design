<script setup lang="ts">
import MaterialItem from '@/editor/panels/material/components/MaterialItem.vue'
import { getMaterialsByGroup, getMaterialGroups } from '@/materials'

defineOptions({
  name: 'MaterialPanel',
})

const activeGroup = ref('info')

const groups = getMaterialGroups()

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
        <span><Icon :icon="item.icon" width="16"></Icon></span>
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="material-list flex-1 p-10 overflow-auto">
      <MaterialItem
        class="mt-10"
        v-for="item in currentMaterials"
        :key="item.name"
        :material="item"
      ></MaterialItem>
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-panel {
  background: bg-mix(20);
  .nav {
    border-right: 1px solid var(--border-color);
    div {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 50px;
      font-size: 12px;
      &.active {
        background: bg-mix(70);
      }
    }
  }
}
</style>
