# ai-screen-design

## 安装依赖

element-plus

tailwindcss unocss

iconify

### vue3-sketch-ruler

- 样式属性

```js
const palette = {
  bgColor: '#1f2937',
  longfgColor: '#6b7280',
  fontColor: '#9ca3af',
  fontShadowColor: '#0e8da7',
  shadowColor: 'rgba(14, 141, 167, 0.14)',
  lineColor: '#22c55e',
  lineType: 'solid',
  lockLineColor: '#4b5563',
  borderColor: '#374151',
  hoverBg: '#111827',
  hoverColor: '#ffffff',
}
```

### 批处理撤销重做

```js
const obj = {
  a: 1,
}

const undoStack = [
  [
    { target: obj, key: 'a', newValue: 4, oldValue: 1 },

    // { target: obj, key: 'a', newValue: 3, oldValue: 2 },
    // { target: obj, key: 'a', newValue: 4, oldValue: 3 },
  ],
]
```

### 数据源

静态数据源

```json
[
  {
    "id": "123",
    "name": "销售数据",
    "type": "static",
    "data": [
      {
        "label": "一月",
        "value": 100
      },
      {
        "label": "二月",
        "value": 200
      },
      {
        "label": "三月",
        "value": 300
      }
    ]
  },
  {
    "id": "456",
    "name": "访问量数据",
    "type": "static",
    "data": [
      {
        "label": "周一",
        "value": 1200
      },
      {
        "label": "周二",
        "value": 1680
      },
      {
        "label": "周三",
        "value": 1520
      }
    ]
  }
]
```

```json
{
  "type": "event",
  "event_id": "78",
  "seq": 78,
  "method": "messages",
  "params": {
    "namespace": ["answerMessage:a1860d28-5a60-5251-9636-93a20245cfd6"],
    "timestamp": 1786887550704,
    "data": {
      "event": "content-block-delta",
      "index": 0,
      "delta": { "type": "text-delta", "text": "千问，由" },
      "run_id": "01a00acc-2b26-7718-976e-74425b8a5bac"
    }
  }
}
```
