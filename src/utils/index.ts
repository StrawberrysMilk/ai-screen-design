export function debounce(fn, ms) {
  let timer
  return function (this, ...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}

/**
 * 根据key获取对象的值
 * @param target
 * @param key
 */
export function getValue(target, key) {
  const keys = key.split('.')
  while (keys.length) {
    const key = keys.shift()
    target = target[key]
  }
  return target
}

/**
 * 根据key设置对象的值
 * @param target
 * @param key
 * @param value
 */
// function setValue(target, key, value) {
//   const keys = key.split('.')
//   while (keys.length > 1) {
//     const key = keys.shift()
//     target = target[key]
//   }
//   target[keys[0]] = value
// }

export function setValue(target, key, value) {
  const keys = key.split('.')
  const lastKey = keys.pop()
  if (keys.length) {
    target = getValue(target, keys.join('.'))
  }
  target[lastKey] = value
}
