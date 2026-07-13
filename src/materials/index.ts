import type { Component } from 'vue'

import type { MaterialDefinition, settersSchema } from '@/schema/material.ts'

const materials: MaterialDefinition[] = []

// text =>> TextMaterial
// bar =>> ChartsMaterial
const componentMap = new Map<string, Component>()
const settersMap = new Map<string, settersSchema[]>()

export function register(material: MaterialDefinition, component?: Component) {
  materials.push(material)
  if (component) {
    componentMap.set(material.schema.type, component)
    settersMap.set(material.schema.type, material.setters)
  }
}

// 定义模块具备install方法的类型约束
type Register = typeof register
type InstallableModule = {
  install?: (register: Register) => void
}
const materialModules: Record<string, unknown> = import.meta.glob('./*/index.ts', { eager: true })
Object.values(materialModules).forEach((module: unknown) => {
  // 类型守卫做类型缩小
  const mod = module as InstallableModule
  if (mod.install) {
    mod.install(register)
  }
})

const groups = [
  { name: '图表', icon: 'solar:chart-bold', key: 'charts' },
  { name: '信息', icon: 'ant-design:form-outlined', key: 'info' },
]

export function getMaterialsByGroup(group: string) {
  return materials.filter((item) => item.group === group)
}

export function getMaterialsGroupt() {
  return groups
}

export function getMaterialComponent(type: string) {
  return componentMap.get(type)
}

export function getMaterialSetters(type: string) {
  return settersMap.get(type)
}

export function createNode(node) {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}
