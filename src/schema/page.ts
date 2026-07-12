import type { MaterialSchema } from '@/schema/material.ts'

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  canvas: CanvasSchema
  nodes: MaterialSchema[]
}
