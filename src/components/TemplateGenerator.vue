<template>
  <div class="template-generator">
    <div v-if="!templateData" class="empty-state">
      <div class="empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <h3 class="empty-title">{{ t('templateGenerator.noTemplate') }}</h3>
      <p class="empty-description">{{ t('templateGenerator.noTemplateDesc') }}</p>
    </div>

    <div v-else class="template-content">
      <div class="template-header">
        <div class="template-info">
          <h3 class="template-name">{{ templateData.name }}</h3>
          <div class="template-meta">
            <span>{{ templateData.width }} × {{ templateData.height }} beads</span>
            <span>•</span>
            <span>{{ templateData.beadSize }}</span>
            <span>•</span>
            <span>{{ templateData.brand }}</span>
            <span>•</span>
            <span>{{ templateData.totalPages }} pages</span>
          </div>
        </div>
        <div class="template-actions">
          <button @click="exportImage" class="btn btn-primary btn-compact">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ t('templateGenerator.exportPNG') }}
          </button>
          <button @click="printTemplate" class="btn btn-secondary btn-compact">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 9V2h12v7"></path>
              <path
                d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
              ></path>
              <path d="M6 14h12v8H6z"></path>
            </svg>
            {{ t('templateGenerator.print') }}
          </button>
          <button
            @click="showSettings = !showSettings"
            class="btn-icon"
            :title="t('templateGenerator.settings')"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M12 1v6m0 6v6m5.25-12.75l-5.196 3m3.464 3.464l5.196 3M1 12h6m6 0h6m-12.75-5.25l3-5.196m3.464 3.464l3 5.196"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showSettings" class="template-settings">
        <div class="setting-group">
          <label>
            <input type="checkbox" v-model="showGrid" />
            {{ t('templateGenerator.showGrid') }}
          </label>
          <label>
            <input type="checkbox" v-model="showNumbers" />
            {{ t('templateGenerator.showColorCodes') }}
          </label>
          <label>
            <input type="checkbox" v-model="showColors" />
            {{ t('templateGenerator.showColors') }}
          </label>
        </div>
        <div class="setting-group">
          <label>{{ t('templateGenerator.cellSize') }}: {{ cellSize }}px</label>
          <input type="range" v-model.number="cellSize" min="5" max="60" step="1" />
        </div>
      </div>

      <div class="template-preview">
        <div class="preview-controls">
          <button
            @click="zoomOut"
            :disabled="scale <= 0.25"
            class="btn-icon"
            :title="t('imageUploader.zoomOut')"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <span class="zoom-level">{{
            t('templateGenerator.zoomLevel', { percent: Math.round(scale * 100) })
          }}</span>
          <button
            @click="zoomIn"
            :disabled="scale >= 2"
            class="btn-icon"
            :title="t('imageUploader.zoomIn')"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button @click="resetZoom" class="btn-icon" :title="t('templateGenerator.resetZoom')">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </div>

        <div class="preview-canvas-container" ref="canvasContainer">
          <canvas
            ref="templateCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            class="template-canvas"
            :style="{ transform: `scale(${scale})` }"
          ></canvas>
        </div>
      </div>

      <div class="color-legend" :class="{ collapsed: isLegendCollapsed }">
        <div class="legend-header" @click="isLegendCollapsed = !isLegendCollapsed">
          <h4 class="legend-title">{{ t('templateGenerator.colorLegend') }}</h4>
          <span class="legend-count"
            >{{ sortedColorCounts.length }} {{ t('templateGenerator.colors') }}</span
          >
          <button class="legend-toggle">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :style="{ transform: isLegendCollapsed ? 'rotate(-90deg)' : 'rotate(0)' }"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        <div v-show="!isLegendCollapsed" class="legend-grid">
          <div
            v-for="[colorId, count] in sortedColorCounts"
            :key="colorId"
            class="legend-item"
            :title="`${getColorById(colorId)?.name} (${getColorById(colorId)?.code})`"
          >
            <span class="legend-color" :style="{ background: getColorById(colorId)?.hex }"></span>
            <span class="legend-code">{{ getColorById(colorId)?.code }}</span>
            <span class="legend-count">×{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TemplateData, CanvasDrawOptions } from '@/types'
import { downloadCanvas } from '@/utils/canvas'
import { printTemplate as printTemplateUtil } from '@/utils/export'
import { getColorById } from '@/assets/data/beadColors'

const { t } = useI18n()

interface Props {
  templateData: TemplateData | null
}

interface Emits {
  (e: 'update:templateData', value: TemplateData | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const templateCanvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLElement | null>(null)

const showSettings = ref(false)
const showGrid = ref(true)
const showNumbers = ref(true)
const showColors = ref(true)
const cellSize = ref(15)
const scale = ref(1)
const isLegendCollapsed = ref(false)

const canvasWidth = computed(() => {
  if (!props.templateData) return 0
  return props.templateData.width * cellSize.value
})

const canvasHeight = computed(() => {
  if (!props.templateData) return 0
  return props.templateData.height * cellSize.value
})

const sortedColorCounts = computed(() => {
  if (!props.templateData) return []
  return Array.from(props.templateData.colorCounts.entries()).sort((a, b) => b[1] - a[1])
})

const drawOptions = computed<CanvasDrawOptions>(() => ({
  showGrid: showGrid.value,
  showNumbers: showNumbers.value,
  showColors: showColors.value,
  cellSize: cellSize.value,
}))

const render = () => {
  if (!props.templateData || !templateCanvas.value) return

  const ctx = templateCanvas.value.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 绘制背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 绘制每个像素
  for (let row = 0; row < props.templateData.height; row++) {
    for (let col = 0; col < props.templateData.width; col++) {
      const pixel = props.templateData.pixels[row]?.[col]
      if (!pixel) continue

      const x = col * cellSize.value
      const y = row * cellSize.value

      if (showColors.value) {
        // 绘制颜色单元格
        ctx.fillStyle = pixel.color.hex
        ctx.fillRect(x + 1, y + 1, cellSize.value - 2, cellSize.value - 2)
      }

      if (showGrid.value) {
        // 绘制网格
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, cellSize.value, cellSize.value)
      }

      if (showNumbers.value) {
        // 绘制颜色代码
        ctx.fillStyle = '#333333'
        ctx.font = `${Math.max(8, cellSize.value / 2)}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(pixel.color.code, x + cellSize.value / 2, y + cellSize.value / 2)
      }
    }
  }
}

const zoomIn = () => {
  scale.value = Math.min(2, scale.value + 0.25)
}

const zoomOut = () => {
  scale.value = Math.max(0.25, scale.value - 0.25)
}

const resetZoom = () => {
  scale.value = 1
}

const exportImage = () => {
  if (!templateCanvas.value || !props.templateData) return
  downloadCanvas(templateCanvas.value, `${props.templateData.name}_template.png`, 'image/png')
}

const printTemplate = () => {
  if (!templateCanvas.value || !props.templateData) return
  printTemplateUtil(templateCanvas.value, {
    format: 'png',
    includeColorLegend: true,
    includeRowColNumbers: true,
    includePageNumbers: true,
    dpi: 300,
    paperSize: 'A4',
    margin: 10,
  })
}

// 监听变化重新渲染
watch(
  [drawOptions, () => props.templateData],
  () => {
    nextTick(() => {
      render()
    })
  },
  { deep: true },
)

onMounted(() => {
  nextTick(() => {
    render()
  })
})
</script>

<style scoped lang="scss">
.template-generator {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #999;
}

.template-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.template-meta {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #ff6b9d;
    color: #ff6b9d;
    background: rgba(255, 107, 157, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.template-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.setting-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #333;
    cursor: pointer;
  }

  input[type='range'] {
    width: 150px;
  }
}

.template-preview {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  flex: 1;
  min-height: 0;
}

.preview-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
  flex-shrink: 0;
}

.zoom-level {
  font-size: 0.875rem;
  color: #666;
  min-width: 50px;
  text-align: center;
}

.preview-canvas-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px;
  min-height: 0;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 107, 157, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 157, 0.5);
    }
  }
}

.template-canvas {
  display: block;
  transform-origin: center top;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-legend {
  padding: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.3s ease;

  &.collapsed {
    .legend-grid {
      display: none;
    }
  }
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(255, 138, 128, 0.1) 100%);
  }
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.legend-count {
  font-size: 0.75rem;
  color: #666;
  flex: 1;
}

.legend-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #ff6b9d;
  }
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  max-height: 120px;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 107, 157, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 107, 157, 0.4);
    }
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 0.7rem;
}

.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.legend-code {
  font-size: 0.7rem;
  font-weight: 600;
  color: #333;
  font-family: monospace;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-count {
  font-size: 0.7rem;
  color: #666;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &.btn-primary {
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
    color: white;

    &:hover {
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
    }
  }

  &.btn-secondary {
    background: #f5f5f5;
    color: #333;

    &:hover {
      background: #e0e0e0;
    }
  }

  &.btn-compact {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .template-header {
    flex-direction: column;
    gap: 1rem;
  }

  .template-meta {
    flex-wrap: wrap;
  }

  .template-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .btn-compact {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}
</style>
