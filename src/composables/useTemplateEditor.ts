import { ref, computed } from 'vue'
import type { PixelInfo, BeadColor } from '@/types'

export type EditTool = 'brush' | 'fill' | 'eyedropper'

interface EditHistory {
  pixels: PixelInfo[][]
  timestamp: number
}

export function useTemplateEditor() {
  const currentTool = ref<EditTool>('brush')
  const selectedColor = ref<BeadColor | null>(null)
  const isEditing = ref(false)

  // 历史记录（用于撤销/重做）
  const history = ref<EditHistory[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  /**
   * 设置当前工具
   */
  const setTool = (tool: EditTool) => {
    currentTool.value = tool
  }

  /**
   * 设置选中的颜色
   */
  const setSelectedColor = (color: BeadColor) => {
    selectedColor.value = color
  }

  /**
   * 保存历史记录
   */
  const saveHistory = (pixels: PixelInfo[][]) => {
    // 深拷贝像素数据
    const pixelsCopy = pixels.map((row) => row.map((pixel) => ({ ...pixel })))

    // 删除当前索引之后的历史记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // 添加新的历史记录
    history.value.push({
      pixels: pixelsCopy,
      timestamp: Date.now(),
    })

    // 限制历史记录大小
    if (history.value.length > maxHistorySize) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  /**
   * 撤销
   */
  const undo = (): PixelInfo[][] | null => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      return history.value[historyIndex.value]?.pixels || null
    }
    return null
  }

  /**
   * 重做
   */
  const redo = (): PixelInfo[][] | null => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      return history.value[historyIndex.value]?.pixels || null
    }
    return null
  }

  /**
   * 是否可以撤销
   */
  const canUndo = computed(() => historyIndex.value > 0)

  /**
   * 是否可以重做
   */
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  return {
    currentTool,
    selectedColor,
    isEditing,
    canUndo,
    canRedo,
    setTool,
    setSelectedColor,
    saveHistory,
    undo,
    redo,
    clearHistory,
  }
}
