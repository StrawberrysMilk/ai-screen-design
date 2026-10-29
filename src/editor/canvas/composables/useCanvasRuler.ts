import { debounce } from '@/utils'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'

export function useCanvasRuler({ moveableRef, canvasRootRef }) {
  const editorStore = useEditorStore()

  const { canvas } = storeToRefs(editorStore)
  const canvasWidth = computed(() => canvas.value.width)
  const canvasHeight = computed(() => canvas.value.height)

  const canvasStyle = computed(() => {
    return {
      width: canvasWidth.value + 'px',
      height: canvasHeight.value + 'px',
      backgroundColor: canvas.value.backgroundColor,
    }
  })

  const lines = ref({ h: [], v: [] })
  const rectWidth = ref(1000)
  const rectHeight = ref(800)
  const scale = ref(1)

  const palette = {
    bgColor: '#1f2937',
    longfgColor: '#6b7280',
    fontColor: '#9ca3af',
    fontShadowColor: '#0e8da7',
    shadowColor: 'rgba(14, 141, 167, 0.14)',
    lineColor: '#22c55e',
    lineType: 'solid',
    lockLineColor: '#4b5563',
    borderColor: '#374151',
    hoverBg: '#111827',
    hoverColor: '#ffffff',
  }

  const onRootResize = debounce((rect) => {
    rectWidth.value = rect.width
    rectHeight.value = rect.height
  }, 300)

  onMounted(() => {
    const { width, height } = canvasRootRef.value.getBoundingClientRect()
    rectWidth.value = width
    rectHeight.value = height

    const ob = new ResizeObserver((entries) => {
      const entry = entries[0]
      const rect = entry.contentRect
      onRootResize(rect)
    })

    ob.observe(canvasRootRef.value)

    onUnmounted(() => {
      ob.disconnect()
    })
  })

  function onZoomChange() {
    moveableRef.value.updateRect()
  }

  return {
    canvasWidth,
    canvasHeight,
    canvasStyle,
    rectHeight,
    rectWidth,
    lines,
    scale,
    palette,
    onZoomChange,
  }
}
