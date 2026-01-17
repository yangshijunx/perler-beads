import type { PixelInfo, BeadColor, BeadSize, CanvasDrawOptions } from '@/types'
import { BEAD_SIZE_SPECS } from '@/types'

/**
 * 创建一个离屏 Canvas
 */
export function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * 在 Canvas 上绘制网格
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number,
  color: string = '#cccccc'
): void {
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  // 绘制垂直线
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // 绘制水平线
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

/**
 * 在 Canvas 上绘制圆形单元格（模拟豆子形状）
 */
export function drawBeadCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  showBorder: boolean = true
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2)
  ctx.fill()

  if (showBorder) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

/**
 * 在 Canvas 上绘制方形单元格
 */
export function drawSquareCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  showBorder: boolean = true
): void {
  ctx.fillStyle = color
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2)

  if (showBorder) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2)
  }
}

/**
 * 绘制行列编号
 */
export function drawRowColNumbers(
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number,
  cellSize: number,
  margin: number = 30
): void {
  ctx.fillStyle = '#333333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 绘制行号（左侧）
  for (let row = 0; row < rows; row++) {
    ctx.fillText(
      String(row + 1),
      margin / 2,
      margin + row * cellSize + cellSize / 2
    )
  }

  // 绘制列号（顶部）
  for (let col = 0; col < cols; col++) {
    ctx.fillText(
      String(col + 1),
      margin + col * cellSize + cellSize / 2,
      margin / 2
    )
  }
}

/**
 * 绘制色块图例
 */
export function drawColorLegend(
  ctx: CanvasRenderingContext2D,
  colors: Map<string, number>,
  startX: number,
  startY: number,
  cellSize: number = 20
): void {
  const colorArray = Array.from(colors.entries()).sort((a, b) => b[1] - a[1])
  const legendWidth = 300
  const legendHeight = colorArray.length * (cellSize + 10) + 60

  // 背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(startX, startY, legendWidth, legendHeight)
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 2
  ctx.strokeRect(startX, startY, legendWidth, legendHeight)

  // 标题
  ctx.fillStyle = '#333333'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('Color Legend', startX + 10, startY + 10)

  // 色块列表
  ctx.font = '12px Arial'
  colorArray.forEach(([colorId, count], index) => {
    const y = startY + 40 + index * (cellSize + 10)

    // 色块
    ctx.fillStyle = colorId
    ctx.fillRect(startX + 10, y, cellSize, cellSize)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.strokeRect(startX + 10, y, cellSize, cellSize)

    // 颜色名称和数量
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'left'
    ctx.fillText(`${colorId}`, startX + 40, y + cellSize / 2 - 6)
    ctx.fillText(`x${count}`, startX + 150, y + cellSize / 2 - 6)
  })
}

/**
 * 绘制分页信息
 */
export function drawPageInfo(
  ctx: CanvasRenderingContext2D,
  currentPage: number,
  totalPages: number,
  width: number,
  margin: number = 20
): void {
  ctx.fillStyle = '#333333'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(
    `Page ${currentPage} of ${totalPages}`,
    width / 2,
    margin
  )
}

/**
 * 绘制拼接标识
 */
export function draw拼接标识(
  ctx: CanvasRenderingContext2D,
  pageInfo: {
    currentPage: number
    totalPages: number
    startRow: number
    endRow: number
    startCol: number
    endCol: number
  },
  canvasWidth: number,
  canvasHeight: number,
  margin: number = 20
): void {
  ctx.fillStyle = '#666666'
  ctx.font = '12px Arial'
  ctx.textAlign = 'left'

  const { currentPage, totalPages, startRow, endRow, startCol, endCol } = pageInfo

  // 显示拼接信息
  const infoY = canvasHeight - margin
  ctx.fillText(
    `Rows ${startRow + 1}-${endRow + 1} | Cols ${startCol + 1}-${endCol + 1}`,
    margin,
    infoY
  )
}

/**
 * 计算纸张可容纳的行列数
 */
export function calculateGridSize(
  paperWidth: number,
  paperHeight: number,
  beadSize: BeadSize,
  margin: number = 20
): { rows: number; cols: number } {
  const beadDiameter = BEAD_SIZE_SPECS[beadSize]
  const availableWidth = paperWidth - margin * 2
  const availableHeight = paperHeight - margin * 2

  const cols = Math.floor(availableWidth / beadDiameter)
  const rows = Math.floor(availableHeight / beadDiameter)

  return { rows, cols }
}

/**
 * 计算 A4 纸张可容纳的豆子数量
 */
export function calculateA4GridSize(
  beadSize: BeadSize,
  margin: number = 20
): { rows: number; cols: number } {
  // A4 尺寸: 210mm x 297mm
  // 转换为像素 (假设 96 DPI): 794px x 1123px
  const a4Width = 794
  const a4Height = 1123

  return calculateGridSize(a4Width, a4Height, beadSize, margin)
}

/**
 * 计算总页数
 */
export function calculateTotalPages(
  totalRows: number,
  totalCols: number,
  rowsPerPage: number,
  colsPerPage: number
): number {
  const pagesByRow = Math.ceil(totalRows / rowsPerPage)
  const pagesByCol = Math.ceil(totalCols / colsPerPage)

  return pagesByRow * pagesByCol
}

/**
 * 生成缩略图
 */
export function generateThumbnail(
  sourceCanvas: HTMLCanvasElement,
  maxSize: number = 200
): string {
  const { width, height } = sourceCanvas
  const scale = Math.min(maxSize / width, maxSize / height)

  const thumbnailCanvas = createOffscreenCanvas(
    Math.floor(width * scale),
    Math.floor(height * scale)
  )

  const ctx = thumbnailCanvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  ctx.drawImage(sourceCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height)

  return thumbnailCanvas.toDataURL('image/png')
}

/**
 * Canvas 转换为 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, type, quality)
  })
}

/**
 * 下载 Canvas 内容
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type: string = 'image/png'
): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL(type)
  link.click()
}
