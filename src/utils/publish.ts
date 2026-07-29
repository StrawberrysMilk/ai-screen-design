import type { PageSchema } from '@/schema/page.ts'

/**
 * 存到 localStorage 中的 key
 */
const SCREEN_PUBLISH = 'screen-published'

export function publishPage(page: PageSchema) {
  let value: any = localStorage.getItem(SCREEN_PUBLISH)
  if (value) {
    /**
     * 如果已经有发布的页面了，那么就把新的页面添加到已有的页面中
     */
    value = JSON.parse(value)
  } else {
    /**
     * 无论如何，发布的页面都是一个对象，key为id，value为页面数据
     */
    value = {}
  }
  const id = page.id || crypto.randomUUID()
  value[id] = page
  page.id = id
  localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(value))
  return id
}

export function getPublishedPage(id: string): PageSchema | null {
  const value = localStorage.getItem(SCREEN_PUBLISH)
  const map = JSON.parse(value)
  const page = map[id]
  if (page) {
    return page
  }
  throw Error('数据库里面没查到这个id为' + id + '的页面')
}
