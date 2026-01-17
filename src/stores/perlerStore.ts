import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  TemplateData,
  HistoryItem,
  BeadBrand,
  BeadSize,
  ImageProcessOptions
} from '@/types'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { getColorPalette } from '@/assets/data/beadColors'

export const usePerlerStore = defineStore('perler', () => {
  // Local storage composable
  const { getHistory, addHistoryItem, removeHistoryItem, clearHistory, saveTemplate, getTemplate, removeTemplate } = useLocalStorage()

  // 状态
  const currentTemplate = ref<TemplateData | null>(null)
  const selectedBrand = ref<BeadBrand>('hama')
  const selectedBeadSize = ref<BeadSize>('regular')
  const processingOptions = ref<ImageProcessOptions>({
    width: 50,
    height: 50,
    beadSize: 'regular',
    brand: 'hama',
    dithering: false,
    contrast: 1,
    brightness: 1
  })
  const isProcessing = ref(false)
  const processingProgress = ref(0)

  // 计算属性
  const currentColorPalette = computed(() => getColorPalette(selectedBrand.value))
  const history = computed(() => getHistory())
  const historyCount = computed(() => history.value.length)

  // 获取模板
  const loadTemplate = (id: string): TemplateData | null => {
    const template = getTemplate(id)
    if (template) {
      currentTemplate.value = template
      // 更新处理选项
      selectedBrand.value = template.brand
      selectedBeadSize.value = template.beadSize
      processingOptions.value = {
        width: template.width,
        height: template.height,
        beadSize: template.beadSize,
        brand: template.brand
      }
    }
    return template
  }

  // 设置当前模板
  const setCurrentTemplate = (template: TemplateData | null) => {
    currentTemplate.value = template
    if (template) {
      // 保存到本地存储
      saveTemplate(template)
      // 添加到历史记录
      const historyItem: HistoryItem = {
        id: template.id,
        name: template.name,
        thumbnail: template.imageData,
        createdAt: template.createdAt,
        beadSize: template.beadSize,
        brand: template.brand,
        width: template.width,
        height: template.height
      }
      addHistoryItem(historyItem)
    }
  }

  // 更新处理选项
  const updateProcessingOptions = (options: Partial<ImageProcessOptions>) => {
    processingOptions.value = { ...processingOptions.value, ...options }
  }

  // 设置品牌
  const setBrand = (brand: BeadBrand) => {
    selectedBrand.value = brand
    processingOptions.value.brand = brand
  }

  // 设置豆子尺寸
  const setBeadSize = (size: BeadSize) => {
    selectedBeadSize.value = size
    processingOptions.value.beadSize = size
  }

  // 删除模板
  const deleteTemplate = (id: string) => {
    removeTemplate(id)
    removeHistoryItem(id)
    if (currentTemplate.value?.id === id) {
      currentTemplate.value = null
    }
  }

  // 清除所有历史记录
  const clearAllHistory = () => {
    clearHistory()
    currentTemplate.value = null
  }

  // 设置处理状态
  const setProcessingState = (processing: boolean, progress: number = 0) => {
    processingProgress.value = progress
    isProcessing.value = processing
  }

  // 获取颜色统计
  const getColorStatistics = computed(() => {
    if (!currentTemplate.value) {
      return new Map<string, number>()
    }
    return currentTemplate.value.colorCounts
  })

  // 获取所需豆子列表
  const getRequiredBeads = computed(() => {
    const stats = getColorStatistics.value
    return Array.from(stats.entries())
      .map(([colorId, count]) => {
        const color = currentColorPalette.value.find(c => c.id === colorId)
        return {
          color,
          count
        }
      })
      .filter(item => item.color !== undefined)
      .sort((a, b) => b.count - a.count)
  })

  // 导出状态
  return {
    // 状态
    currentTemplate,
    selectedBrand,
    selectedBeadSize,
    processingOptions,
    isProcessing,
    processingProgress,
    // 计算属性
    currentColorPalette,
    history,
    historyCount,
    getColorStatistics,
    getRequiredBeads,
    // 方法
    setCurrentTemplate,
    loadTemplate,
    updateProcessingOptions,
    setBrand,
    setBeadSize,
    deleteTemplate,
    clearAllHistory,
    setProcessingState
  }
})
