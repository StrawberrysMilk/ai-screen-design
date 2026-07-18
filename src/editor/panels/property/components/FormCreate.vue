<script setup lang="ts">
import { getValue, setValue } from '@/utils'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

defineOptions({
  name: 'FormCreate',
})

defineProps(['setters', 'formData'])

const { applyChange, startBatch, commitBatch } = useUndoRedo()
const componentMap = {
  input: ElInput,
  number: (props) => h(ElInputNumber, { precision: 0, ...props }),
  select: ElSelect,
  checkbox: ElCheckbox,
  color: ElColorPicker,
}
</script>

<template>
  <el-form size="small" class="p-20" label-width="60">
    <el-row>
      <el-col v-for="item in setters" :key="item.key" :span="item.span || 24">
        <el-form-item :label="item.label">
          <component
            :is="componentMap[item.type]"
            :modelValue="getValue(formData, item.key)"
            v-bing="item.props"
            @update:modelValue="(val) => applyChange(formData, item.key, val)"
            @focus="startBatch"
            @blur="commitBatch"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss"></style>
