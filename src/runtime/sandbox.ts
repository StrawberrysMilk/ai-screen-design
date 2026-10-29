/**
 * 全局白名单，表示沙箱环境可以访问的全局属性
 */
const globalKeys = new Set(['console', 'Promise', 'setTimeout'])

/**
 * 在沙箱中运行代码
 */
export function runSandbox(code: string, scope: Record<string, any>) {
  const sandbox = new Proxy(scope, {
    has() {
      return true
    },
    get(target, key) {
      // 过滤 Symbol.unscopables 属性
      if (key === Symbol.unscopables) return
      if (Object.hasOwn(target, key)) {
        // 访问 target 属性
        return target[key as string]
      }
      if (globalKeys.has(key as string)) {
        const value = globalThis[key]
        return typeof value === 'function' ? value.bind(globalThis) : value
      }
    },
  })

  const fn = new Function(
    'sandbox',
    `
    const asyncFn = async () => {
       with (sandbox) {
       ${code}
      }
    }
    asyncFn()
`,
  )

  fn(sandbox)
}
