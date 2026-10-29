import type { ZodType } from 'zod'

export function toJSONSchema(schema: ZodType) {
  return schema.toJSONSchema({
    override({ jsonSchema }) {
      delete jsonSchema.propertyNames
    },
  })
}
