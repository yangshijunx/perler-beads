import { ref, watch } from 'vue'
import type { HistoryItem, TemplateData } from '@/types'

const STORAGE_KEYS = {
  HISTORY: 'perler_beads_history',
  SETTINGS: 'perler_beads_settings',
  TEMPLATES: 'perler_beads_templates'
}

export function useLocalStorage() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 通用存储函数
   */
  const setItem = <T>(key: string, value: T): boolean => {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save to localStorage'
      return false
    }
  }

  /**
   * 通用获取函数
   */
  const getItem = <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item) as T
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to read from localStorage'
      return defaultValue
    }
  }

  /**
   * 通用删除函数
   */
  const removeItem = (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove from localStorage'
      return false
    }
  }

  /**
   * 保存历史记录
   */
  const saveHistory = (history: HistoryItem[]): boolean => {
    return setItem(STORAGE_KEYS.HISTORY, history)
  }

  /**
   * 获取历史记录
   */
  const getHistory = (): HistoryItem[] => {
    const history = getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, [])
    // 恢复日期对象
    return history.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }))
  }

  /**
   * 添加历史记录项
   */
  const addHistoryItem = (item: HistoryItem): boolean => {
    try {
      const history = getHistory()
      // 检查是否已存在
      const existingIndex = history.findIndex(h => h.id === item.id)
      if (existingIndex >= 0) {
        history[existingIndex] = item
      } else {
        history.unshift(item)
      }
      // 限制历史记录数量（最多保存50条）
      const limitedHistory = history.slice(0, 50)
      return saveHistory(limitedHistory)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add history item'
      return false
    }
  }

  /**
   * 删除历史记录项
   */
  const removeHistoryItem = (id: string): boolean => {
    try {
      const history = getHistory()
      const filtered = history.filter(item => item.id !== id)
      return saveHistory(filtered)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove history item'
      return false
    }
  }

  /**
   * 清除所有历史记录
   */
  const clearHistory = (): boolean => {
    return removeItem(STORAGE_KEYS.HISTORY)
  }

  /**
   * 保存模板数据
   */
  const saveTemplate = (template: TemplateData): boolean => {
    try {
      const templates = getTemplates()
      templates.set(template.id, template)
      return setItem(STORAGE_KEYS.TEMPLATES, Array.from(templates.entries()))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save template'
      return false
    }
  }

  /**
   * 获取所有模板数据
   */
  const getTemplates = (): Map<string, TemplateData> => {
    const templates = getItem<Array<[string, TemplateData]>>(
      STORAGE_KEYS.TEMPLATES,
      []
    )
    const map = new Map<string, TemplateData>()
    templates.forEach(([id, data]) => {
      // 恢复日期对象
      data.createdAt = new Date(data.createdAt)
      // 恢复 Map 对象
      if (data.colorCounts && Array.isArray(data.colorCounts)) {
        data.colorCounts = new Map(data.colorCounts)
      }
      map.set(id, data)
    })
    return map
  }

  /**
   * 获取单个模板
   */
  const getTemplate = (id: string): TemplateData | null => {
    const templates = getTemplates()
    return templates.get(id) || null
  }

  /**
   * 删除模板
   */
  const removeTemplate = (id: string): boolean => {
    try {
      const templates = getTemplates()
      templates.delete(id)
      return setItem(STORAGE_KEYS.TEMPLATES, Array.from(templates.entries()))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove template'
      return false
    }
  }

  /**
   * 保存设置
   */
  const saveSettings = (settings: Record<string, unknown>): boolean => {
    return setItem(STORAGE_KEYS.SETTINGS, settings)
  }

  /**
   * 获取设置
   */
  const getSettings = <T extends Record<string, unknown>>(
    defaultSettings: T
  ): T => {
    return getItem(STORAGE_KEYS.SETTINGS, defaultSettings)
  }

  /**
   * 更新单个设置项
   */
  const updateSetting = <K extends keyof T, T extends Record<string, unknown>>(
    key: K,
    value: T[K]
  ): boolean => {
    try {
      const settings = getSettings({} as T)
      settings[key] = value
      return saveSettings(settings)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update setting'
      return false
    }
  }

  /**
   * 获取存储使用情况
   */
  const getStorageUsage = (): { used: number; total: number; percentage: number } => {
    try {
      let used = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }
      // localStorage 通常是 5-10MB，这里估算为 5MB
      const total = 5 * 1024 * 1024
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100)
      }
    } catch {
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 }
    }
  }

  /**
   * 清除所有应用数据
   */
  const clearAllData = (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear data'
      return false
    }
  }

  /**
   * 导出所有数据
   */
  const exportAllData = (): string => {
    try {
      const data = {
        history: getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, []),
        templates: getItem<Array<[string, TemplateData]>>(STORAGE_KEYS.TEMPLATES, []),
        settings: getItem(STORAGE_KEYS.SETTINGS, {}),
        exportDate: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to export data'
      throw e
    }
  }

  /**
   * 导入数据
   */
  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData)
      if (data.history) {
        setItem(STORAGE_KEYS.HISTORY, data.history)
      }
      if (data.templates) {
        setItem(STORAGE_KEYS.TEMPLATES, data.templates)
      }
      if (data.settings) {
        setItem(STORAGE_KEYS.SETTINGS, data.settings)
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to import data'
      return false
    }
  }

  /**
   * 响应式状态管理
   */
  const useReactiveHistory = () => {
    const history = ref<HistoryItem[]>(getHistory())

    watch(
      history,
      (newHistory) => {
        saveHistory(newHistory)
      },
      { deep: true }
    )

    return {
      history,
      addHistoryItem: (item: HistoryItem) => {
        const existingIndex = history.value.findIndex(h => h.id === item.id)
        if (existingIndex >= 0) {
          history.value[existingIndex] = item
        } else {
          history.value.unshift(item)
        }
        // 限制数量
        if (history.value.length > 50) {
          history.value = history.value.slice(0, 50)
        }
      },
      removeHistoryItem: (id: string) => {
        history.value = history.value.filter(item => item.id !== id)
      },
      clearHistory: () => {
        history.value = []
      }
    }
  }

  /**
   * 响应式设置管理
   */
  const useReactiveSettings = <T extends Record<string, unknown>>(
    defaultSettings: T
  ) => {
    const settings = ref<T>(getSettings(defaultSettings))

    watch(
      settings,
      (newSettings) => {
        saveSettings(newSettings)
      },
      { deep: true }
    )

    return settings
  }

  return {
    isLoading,
    error,
    setItem,
    getItem,
    removeItem,
    // 历史记录相关
    saveHistory,
    getHistory,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
    // 模板相关
    saveTemplate,
    getTemplates,
    getTemplate,
    removeTemplate,
    // 设置相关
    saveSettings,
    getSettings,
    updateSetting,
    // 工具函数
    getStorageUsage,
    clearAllData,
    exportAllData,
    importData,
    // 响应式管理
    useReactiveHistory,
    useReactiveSettings
  }
}
