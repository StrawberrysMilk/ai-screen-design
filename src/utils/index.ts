import { get, set } from 'lodash-es'

export function debounce(fn, ms) {
  let timer
  return function (this, ...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}

export function getValue(target, key) {
  return get(target, key)
}

export function setValue(target, key, value) {
  // 'props.content'
  return set(target, key, value)
}

export function deepClone<T>(value: T): T {
  // 拦截基础类型
  if (typeof value !== 'object' || value === null) return value
  return JSON.parse(JSON.stringify(value))
}
