import type { MaterialDefinition } from '@/materials/type.ts'

const materials: MaterialDefinition[] = []

export function register(material: MaterialDefinition) {
  materials.push(material)
}

const materialModules = import.meta.glob('./*/index.ts', { eager: true })
Object.values(materialModules).forEach((module) => {
  // @ts-ignore
  if (module.install) {
    // @ts-ignore
    module.install(register)
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
