/**
 * 全局白名单，表示沙箱环境可以访问的全局属性
 */
const globalKeys = new Set([
  'console',
  'Promise',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
])
/**
 * 运行沙箱代码
 * @param code
 * @param scope
 */
export function runSandbox(code: string, scope: Record<string, any>) {
  const sandbox = new Proxy(scope, {
    has() {
      return true
    },
    get(target, key) {
      if (key === Symbol.unscopables) return
      if (Object.hasOwn(target, key)) {
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
    const AsyncFn = async () => {
      with(sandbox) {
        ${code}
      }
    }
    AsyncFn()
    `,
  )

  fn(sandbox)
}
