import type { MaterialDefinition } from '@/schema/material.ts'
import type { Component } from 'vue'
import { toJSONSchema } from '@/utils/agent-schema.ts'

const materials: MaterialDefinition[] = []

const componentMap = new Map()
const materialMap = new Map()
export function register(material: MaterialDefinition, component: Component) {
  materials.push(material)
  componentMap.set(material.schema.type, component)
  materialMap.set(material.schema.type, material)
}

const materialModules = import.meta.glob('./*/index.ts', { eager: true })

Object.values(materialModules).forEach((module) => {
  // @ts-ignore
  module.install(register)
})

const groups = [
  {
    name: '图表',
    icon: 'solar:chart-bold',
    key: 'charts',
  },
  {
    name: '信息',
    icon: 'material-symbols:info',
    key: 'info',
  },
]

export function getMaterialsByGroup(group: string) {
  return materials.filter((item) => item.group === group)
}

export function getMaterialGroups() {
  return groups
}

export function getMaterialComponent(type: string) {
  return componentMap.get(type)
}

export function getMaterialSetters(type) {
  return materialMap.get(type)?.setters || []
}

export function getMaterialEventOptions(type) {
  return materialMap.get(type)?.eventOptions || []
}
export function createNode(node) {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}

export function getAllMaterialSchema() {
  return materials.map((item) => {
    return {
      type: item.schema.type,
      name: item.name,
      configSchema: toJSONSchema(item.configSchema),
      eventOptions: item.eventOptions || [],
    }
  })
}
