import Mock from 'mockjs'

Mock.mock(/\/api\/data/, 'get', (options) => {
  // 创建 URL 对象，解析查询参数
  const url = new URL(options.url, location.origin)
  // 创建 URL 参数对象
  const search = new URLSearchParams(url.search)
  const date = search.get('date')
  const data = Mock.mock({
    'list|6': [
      {
        'label|+1': ['一月', '二月', '三月', '四月', '五月', '六月'],
        'value|100-1000': 0,
        date,
      },
    ],
  })
  return data.list
})
