<template>
  <div class="template-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'brush' }"
          @click="setTool('brush')"
          title="画笔工具"
        >
          <span class="icon">✏️</span>
          <span class="label">画笔</span>
        </button>
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'fill' }"
          @click="setTool('fill')"
          title="填充工具"
        >
          <span class="icon">🪣</span>
          <span class="label">填充</span>
        </button>
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'eyedropper' }"
          @click="setTool('eyedropper')"
          title="吸管工具"
        >
          <span class="icon">💧</span>
          <span class="label">吸管</span>
        </button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" :disabled="!canUndo" @click="handleUndo" title="撤销">
          <span class="icon">↶</span>
          <span class="label">撤销</span>
        </button>
        <button class="tool-btn" :disabled="!canRedo" @click="handleRedo" title="重做">
          <span class="icon">↷</span>
          <span class="label">重做</span>
        </button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" @click="zoomOut" title="缩小">
          <span class="icon">🔍-</span>
          <span class="label">缩小</span>
        </button>
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
        <button class="tool-btn" @click="zoomIn" title="放大">
          <span class="icon">🔍+</span>
          <span class="label">放大</span>
        </button>
        <button class="tool-btn" @click="resetZoom" title="重置">
          <span class="icon">⊙</span>
          <span class="label">重置</span>
        </button>
      </div>

      <div class="tool-group">
        <div class="current-color" v-if="selectedColor">
          <div class="color-preview" :style="{ backgroundColor: selectedColor.hex }"></div>
          <span class="color-name">{{ selectedColor.name }}</span>
        </div>
      </div>

      <div class="tool-group">
        <button class="tool-btn btn-save" @click="handleSave" :disabled="!hasUnsavedChanges">
          <span class="icon">💾</span>
          <span class="label">保存</span>
        </button>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="editor-content">
      <!-- 画布区域 -->
      <div class="canvas-container" ref="canvasContainer">
        <canvas
          ref="canvasRef"
          class="editor-canvas"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
        ></canvas>
      </div>

      <!-- 颜色选择面板 -->
      <div class="side-panel">
        <ColorPickerPanel
          :colors="availableColors"
          :selected-color="selectedColor"
          @select="handleColorSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { PixelInfo, BeadColor } from '@/types'
import { useTemplateEditor } from '@/composables/useTemplateEditor'
import { editPixel, floodFill, pickColor } from '@/utils/editor'
import ColorPickerPanel from './ColorPickerPanel.vue'

interface Props {
  pixels: PixelInfo[][]
  availableColors: BeadColor[]
  cellSize?: number
}

interface Emits {
  (e: 'update:pixels', pixels: PixelInfo[][]): void
  (e: 'save', pixels: PixelInfo[][]): void
}

const props = withDefaults(defineProps<Props>(), {
  cellSize: 20,
})

const emit = defineEmits<Emits>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)

const {
  currentTool,
  selectedColor,
  canUndo,
  canRedo,
  setTool,
  setSelectedColor,
  saveHistory,
  undo,
  redo,
} = useTemplateEditor()

const isDrawing = ref(false)
const localPixels = ref<PixelInfo[][]>(props.pixels)
const scale = ref(1)
const hasUnsavedChanges = ref(false)

// 初始化选中第一个颜色
onMounted(() => {
  if (props.availableColors.length > 0 && !selectedColor.value) {
    setSelectedColor(props.availableColors[0]!)
  }

  // 保存初始状态到历史记录
  saveHistory(localPixels.value)

  // 绘制画布
  drawCanvas()
})

// 监听像素变化
watch(
  () => props.pixels,
  (newPixels) => {
    localPixels.value = newPixels
    drawCanvas()
  },
  { deep: true },
)

// 监听本地像素变化
watch(
  localPixels,
  (newPixels) => {
    emit('update:pixels', newPixels)
    hasUnsavedChanges.value = true
    drawCanvas()
  },
  { deep: true },
)

/**
 * 绘制画布
 */
const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rows = localPixels.value.length
  const cols = localPixels.value[0]?.length || 0

  // 设置画布尺寸
  canvas.width = cols * props.cellSize
  canvas.height = rows * props.cellSize

  // 绘制每个像素
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pixel = localPixels.value[row]?.[col]
      if (!pixel) continue

      const x = col * props.cellSize
      const y = row * props.cellSize

      // 绘制色块
      ctx.fillStyle = pixel.color.hex
      ctx.fillRect(x, y, props.cellSize, props.cellSize)

      // 绘制网格线
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, props.cellSize, props.cellSize)
    }
  }
}

/**
 * 获取鼠标位置对应的像素坐标
 */
const getPixelPosition = (event: MouseEvent): { row: number; col: number } | null => {
  const canvas = canvasRef.value
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) / scale.value
  const y = (event.clientY - rect.top) / scale.value

  const col = Math.floor(x / props.cellSize)
  const row = Math.floor(y / props.cellSize)

  const rows = localPixels.value.length
  const cols = localPixels.value[0]?.length || 0

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    return { row, col }
  }

  return null
}

/**
 * 处理鼠标按下
 */
const handleMouseDown = (event: MouseEvent) => {
  const pos = getPixelPosition(event)
  if (!pos) return

  isDrawing.value = true

  if (currentTool.value === 'brush') {
    if (!selectedColor.value) return
    localPixels.value = editPixel(localPixels.value, pos.row, pos.col, selectedColor.value)
    saveHistory(localPixels.value)
  } else if (currentTool.value === 'fill') {
    if (!selectedColor.value) return
    localPixels.value = floodFill(localPixels.value, pos.row, pos.col, selectedColor.value)
    saveHistory(localPixels.value)
  } else if (currentTool.value === 'eyedropper') {
    const color = pickColor(localPixels.value, pos.row, pos.col)
    if (color) {
      setSelectedColor(color)
    }
  }
}

/**
 * 处理鼠标移动
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || currentTool.value !== 'brush') return

  const pos = getPixelPosition(event)
  if (!pos || !selectedColor.value) return

  localPixels.value = editPixel(localPixels.value, pos.row, pos.col, selectedColor.value)
}

/**
 * 处理鼠标抬起
 */
const handleMouseUp = () => {
  if (isDrawing.value && currentTool.value === 'brush') {
    saveHistory(localPixels.value)
  }
  isDrawing.value = false
}

/**
 * 处理鼠标离开
 */
const handleMouseLeave = () => {
  handleMouseUp()
}

/**
 * 处理颜色选择
 */
const handleColorSelect = (color: BeadColor) => {
  setSelectedColor(color)
}

/**
 * 缩放功能
 */
const zoomIn = () => {
  scale.value = Math.min(3, scale.value + 0.25)
}

const zoomOut = () => {
  scale.value = Math.max(0.5, scale.value - 0.25)
}

const resetZoom = () => {
  scale.value = 1
}

/**
 * 保存功能
 */
const handleSave = () => {
  emit('save', localPixels.value)
  hasUnsavedChanges.value = false
}

/**
 * 处理撤销
 */
const handleUndo = () => {
  const pixels = undo()
  if (pixels) {
    localPixels.value = pixels
  }
}

/**
 * 处理重做
 */
const handleRedo = () => {
  const pixels = redo()
  if (pixels) {
    localPixels.value = pixels
  }
}
</script>

<style scoped>
.template-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
}

.tool-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.tool-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #4caf50;
}

.tool-btn.active {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn .icon {
  font-size: 20px;
}

.tool-btn .label {
  font-size: 12px;
}

.zoom-level {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  min-width: 50px;
  text-align: center;
}

.btn-save {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.btn-save:hover:not(:disabled) {
  background: #45a049;
}

.btn-save:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.current-color {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.current-color .color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #ddd;
}

.current-color .color-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.editor-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-canvas {
  display: block;
  cursor: crosshair;
  image-rendering: pixelated;
}

.side-panel {
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
