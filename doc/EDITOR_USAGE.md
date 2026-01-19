# 图纸编辑器使用指南

## 功能概述

图纸编辑器允许用户手动精修生成的拼豆图纸，提供以下功能：

### 1. 编辑工具

- **画笔工具** ✏️：单击或拖动鼠标来绘制单个色块
- **填充工具** 🪣：点击色块，自动填充相同颜色的连续区域
- **吸管工具** 💧：点击色块来选取该颜色

### 2. 历史记录

- **撤销** ↶：撤销上一步操作（最多50步）
- **重做** ↷：重做已撤销的操作

### 3. 颜色选择

- 从右侧颜色面板选择拼豆颜色
- 支持搜索功能，快速找到需要的颜色
- 显示颜色名称、编号和 RGB 值

## 使用方法

### 基础使用

```vue
<template>
  <TemplateEditor
    :pixels="templatePixels"
    :available-colors="colorPalette"
    :cell-size="20"
    @update:pixels="handleUpdate"
  />
</template>

<script setup>
import { ref } from 'vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
import { getColorPalette } from '@/assets/data/beadColors'

const templatePixels = ref([...]) // 你的像素数据
const colorPalette = getColorPalette('hama') // 获取颜色板

const handleUpdate = (newPixels) => {
  templatePixels.value = newPixels
  // 保存或处理更新后的数据
}
</script>
```

### 在现有页面中集成

1. **在图纸预览页面添加"编辑"按钮**

```vue
<button @click="openEditor">编辑图纸</button>
```

2. **跳转到编辑器页面**

```javascript
const openEditor = () => {
  router.push({
    name: 'editor',
    params: { templateId: currentTemplate.id },
  })
}
```

3. **保存编辑结果**

编辑器会自动保存到 localStorage，你也可以自定义保存逻辑。

## 快捷键（计划中）

- `Ctrl/Cmd + Z`：撤销
- `Ctrl/Cmd + Y`：重做
- `B`：切换到画笔工具
- `F`：切换到填充工具
- `I`：切换到吸管工具

## 性能优化建议

- 对于大型图纸（超过 100x100），建议使用较小的 cellSize（如 15-20px）
- 编辑器会自动限制历史记录为 50 步，避免内存占用过大
- 使用填充工具时，算法会自动优化大面积填充的性能

## API 参考

### TemplateEditor Props

| 属性            | 类型          | 默认值 | 说明               |
| --------------- | ------------- | ------ | ------------------ |
| pixels          | PixelInfo[][] | 必需   | 像素数据数组       |
| availableColors | BeadColor[]   | 必需   | 可用的拼豆颜色列表 |
| cellSize        | number        | 20     | 每个色块的像素大小 |

### TemplateEditor Events

| 事件          | 参数          | 说明               |
| ------------- | ------------- | ------------------ |
| update:pixels | PixelInfo[][] | 像素数据更新时触发 |

## 工具函数

### editPixel

编辑单个像素的颜色

```typescript
import { editPixel } from '@/utils/editor'

const newPixels = editPixel(pixels, row, col, newColor)
```

### floodFill

区域填充（油漆桶）

```typescript
import { floodFill } from '@/utils/editor'

const newPixels = floodFill(pixels, startRow, startCol, newColor)
```

### pickColor

获取指定位置的颜色

```typescript
import { pickColor } from '@/utils/editor'

const color = pickColor(pixels, row, col)
```

## 故障排除

### 问题：编辑器画布不显示

**解决方案**：

- 确保 pixels 数据格式正确
- 检查 availableColors 是否为空
- 查看浏览器控制台是否有错误信息

### 问题：撤销/重做不工作

**解决方案**：

- 确保在编辑操作后调用了 saveHistory
- 检查历史记录是否已满（最多50步）

### 问题：填充工具填充了整个画布

**解决方案**：

- 这是正常行为，如果所有色块颜色相同
- 使用撤销功能恢复
