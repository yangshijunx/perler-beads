import type { PixelInfo, BeadColor } from '@/types'

/**
 * 编辑单个像素
 */
export function editPixel(
  pixels: PixelInfo[][],
  row: number,
  col: number,
  color: BeadColor,
): PixelInfo[][] {
  const newPixels = pixels.map((r) => r.map((p) => ({ ...p })))

  if (newPixels[row] && newPixels[row][col]) {
    newPixels[row]![col]!.color = color
  }

  return newPixels
}

/**
 * 区域填充（油漆桶工具）- 使用洪水填充算法
 */
export function floodFill(
  pixels: PixelInfo[][],
  startRow: number,
  startCol: number,
  newColor: BeadColor,
): PixelInfo[][] {
  const newPixels = pixels.map((r) => r.map((p) => ({ ...p })))

  const targetPixel = pixels[startRow]?.[startCol]
  if (!targetPixel) return newPixels

  const targetColorId = targetPixel.color.id
  const newColorId = newColor.id

  // 如果目标颜色和新颜色相同，不需要填充
  if (targetColorId === newColorId) return newPixels

  const rows = pixels.length
  const cols = pixels[0]?.length || 0

  // 使用队列进行广度优先搜索
  const queue: [number, number][] = [[startRow, startCol]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const [row, col] = queue.shift()!
    const key = `${row},${col}`

    // 检查边界和是否已访问
    if (row < 0 || row >= rows || col < 0 || col >= cols || visited.has(key)) {
      continue
    }

    const currentPixel = newPixels[row]?.[col]
    if (!currentPixel || currentPixel.color.id !== targetColorId) {
      continue
    }

    // 标记为已访问并填充颜色
    visited.add(key)
    currentPixel.color = newColor

    // 添加相邻像素到队列
    queue.push([row - 1, col]) // 上
    queue.push([row + 1, col]) // 下
    queue.push([row, col - 1]) // 左
    queue.push([row, col + 1]) // 右
  }

  return newPixels
}

/**
 * 获取像素颜色（吸管工具）
 */
export function pickColor(pixels: PixelInfo[][], row: number, col: number): BeadColor | null {
  const pixel = pixels[row]?.[col]
  return pixel ? pixel.color : null
}

/**
 * 批量替换颜色
 */
export function replaceColor(
  pixels: PixelInfo[][],
  oldColor: BeadColor,
  newColor: BeadColor,
): PixelInfo[][] {
  return pixels.map((row) =>
    row.map((pixel) => ({
      ...pixel,
      color: pixel.color.id === oldColor.id ? newColor : pixel.color,
    })),
  )
}

/**
 * 计算颜色使用统计
 */
export function calculateColorStats(
  pixels: PixelInfo[][],
): Map<string, { color: BeadColor; count: number }> {
  const stats = new Map<string, { color: BeadColor; count: number }>()

  pixels.forEach((row) => {
    row.forEach((pixel) => {
      const colorId = pixel.color.id
      const existing = stats.get(colorId)

      if (existing) {
        existing.count++
      } else {
        stats.set(colorId, {
          color: pixel.color,
          count: 1,
        })
      }
    })
  })

  return stats
}
