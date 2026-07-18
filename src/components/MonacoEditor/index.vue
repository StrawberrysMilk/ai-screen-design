<script setup lang="ts">
import { editor } from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

defineOptions({
  name: 'MonacoEditor',
})

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new JsonWorker()
    if (label === 'typescript' || label === 'javascript') return new TsWorker()

    return new EditorWorker()
  },
}

const props = defineProps<{ lang?: string }>()

const modelValue = defineModel<string>()

// useTemplateRef 同样可以
const editorElement = ref()

onMounted(() => {
  const instance = editor.create(editorElement.value, {
    value: modelValue.value,
    theme: 'vs-dark',
    language: props.lang || 'json',
    fontSize: 14,
    tabSize: 2,
    // 自适应父级节点的宽高
    automaticLayout: true,
  })
  instance.onDidChangeModelContent(() => {
    modelValue.value = instance.getValue()
  })

  onBeforeUnmount(() => {
    instance.dispose()
  })
})
</script>

<template>
  <div class="editor-cantainer" ref="editorElement"></div>
</template>

<style scoped lang="scss">
.editor-cantainer {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
