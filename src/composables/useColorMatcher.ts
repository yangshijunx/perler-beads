import { ref, computed } from 'vue'
import type { BeadColor, ColorMatchResult } from '@/types'
import { findClosestColor, matchColors } from '@/utils/color'

export function useColorMatcher() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 匹配单个颜色
   */
  const matchColor = (
    targetRgb: [number, number, number],
    colorPalette: BeadColor[],
    useDeltaE: boolean = true
  ): ColorMatchResult => {
    try {
      return findClosestColor(targetRgb, colorPalette, useDeltaE)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Color matching failed'
      throw e
    }
  }

  /**
   * 批量匹配颜色
   */
  const batchMatchColors = (
    targetColors: [number, number, number][],
    colorPalette: BeadColor[],
    useDeltaE: boolean = true
  ): ColorMatchResult[] => {
    isLoading.value = true
    error.value = null

    try {
      const results = matchColors(targetColors, colorPalette, useDeltaE)
      return results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Batch color matching failed'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取颜色匹配统计
   */
  const getColorStatistics = (matches: ColorMatchResult[]): Map<string, number> => {
    const stats = new Map<string, number>()

    matches.forEach(match => {
      const colorId = match.color.id
      stats.set(colorId, (stats.get(colorId) || 0) + 1)
    })

    return stats
  }

  /**
   * 按使用频率排序颜色
   */
  const sortColorsByUsage = (
    matches: ColorMatchResult[]
  ): Array<{ color: BeadColor; count: number; distance: number }> => {
    const stats = getColorStatistics(matches)
    const colorMap = new Map<string, { color: BeadColor; distance: number }>()

    matches.forEach(match => {
      colorMap.set(match.color.id, {
        color: match.color,
        distance: match.distance
      })
    })

    return Array.from(stats.entries())
      .map(([colorId, count]) => ({
        ...colorMap.get(colorId)!,
        count
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 获取需要购买的豆子列表
   */
  const getRequiredBeads = (
    matches: ColorMatchResult[],
    ownedBeads: Set<string> = new Set()
  ): Array<{ color: BeadColor; needed: number; owned: number }> => {
    const stats = getColorStatistics(matches)
    const colorMap = new Map<string, BeadColor>()

    matches.forEach(match => {
      colorMap.set(match.color.id, match.color)
    })

    return Array.from(stats.entries())
      .map(([colorId, count]) => ({
        color: colorMap.get(colorId)!,
        needed: count,
        owned: ownedBeads.has(colorId) ? count : 0
      }))
      .sort((a, b) => b.needed - a.needed)
  }

  /**
   * 计算颜色匹配准确度
   */
  const calculateAccuracy = (matches: ColorMatchResult[]): {
    average: number
    min: number
    max: number
    median: number
  } => {
    if (matches.length === 0) {
      return { average: 0, min: 0, max: 0, median: 0 }
    }

    const distances = matches.map(m => m.distance).sort((a, b) => a - b)

    const sum = distances.reduce((acc, d) => acc + d, 0)
    const average = sum / distances.length
    const min = distances[0] ?? 0
    const max = distances[distances.length - 1] ?? 0
    const median = distances[Math.floor(distances.length / 2)] ?? 0

    return { average, min, max, median }
  }

  /**
   * 优化颜色匹配（通过调整阈值）
   */
  const optimizeMatch = (
    targetRgb: [number, number, number],
    colorPalette: BeadColor[],
    maxDistance: number = 10
  ): BeadColor | null => {
    const match = findClosestColor(targetRgb, colorPalette, true)

    if (match.distance > maxDistance) {
      // 返回 null 表示没有足够接近的匹配
      return null
    }

    return match.color
  }

  /**
   * 过滤掉不太匹配的颜色
   */
  const filterPoorMatches = (
    matches: ColorMatchResult[],
    maxDistance: number = 15
  ): ColorMatchResult[] => {
    return matches.filter(match => match.distance <= maxDistance)
  }

  return {
    isLoading,
    error,
    matchColor,
    batchMatchColors,
    getColorStatistics,
    sortColorsByUsage,
    getRequiredBeads,
    calculateAccuracy,
    optimizeMatch,
    filterPoorMatches
  }
}
