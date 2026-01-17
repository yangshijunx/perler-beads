// 拼豆品牌类型
export type BeadBrand = 'hama' | 'perler' | 'artkal' | 'nabbi'

// 豆子颜色
export interface BeadColor {
  id: string
  name: string
  code: string
  rgb: [number, number, number]
  hex: string
  brand: BeadBrand
}

// 豆子类型（大小）
export type BeadSize = 'mini' | 'regular' | 'maxi' | 'mega'

// 豆子尺寸规格 (mm)
export const BEAD_SIZE_SPECS: Record<BeadSize, number> = {
  mini: 2.6,      // Mini beads
  regular: 5,     // Regular/Midi beads (most common)
  maxi: 10,       // Maxi beads
  mega: 15        // Mega beads
}

// 色板配置
export interface ColorPalette {
  brand: BeadBrand
  colors: BeadColor[]
}

// 像素点信息
export interface PixelInfo {
  row: number
  col: number
  color: BeadColor
  originalColor: [number, number, number]
}

// 模版数据
export interface TemplateData {
  id: string
  name: string
  createdAt: Date
  imageData: string
  width: number
  height: number
  beadSize: BeadSize
  brand: BeadBrand
  pixels: PixelInfo[][]
  colorCounts: Map<string, number>
  totalPages: number
}

// 分页信息
export interface PageInfo {
  pageNumber: number
  totalPages: number
  startRow: number
  endRow: number
  startCol: number
  endCol: number
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'pdf'
  includeColorLegend: boolean
  includeRowColNumbers: boolean
  includePageNumbers: boolean
  dpi: number
}

// 打印选项
export interface PrintOptions extends ExportOptions {
  paperSize: 'A4' | 'Letter'
  margin: number
}

// 历史记录项
export interface HistoryItem {
  id: string
  name: string
  thumbnail: string
  createdAt: Date
  beadSize: BeadSize
  brand: BeadBrand
  width: number
  height: number
}

// 图片处理选项
export interface ImageProcessOptions {
  width: number
  height: number
  beadSize: BeadSize
  brand: BeadBrand
  dithering?: boolean
  contrast?: number
  brightness?: number
}

// Canvas 绘制选项
export interface CanvasDrawOptions {
  showGrid: boolean
  showNumbers: boolean
  showColors: boolean
  cellSize: number
}

// 颜色匹配结果
export interface ColorMatchResult {
  color: BeadColor
  distance: number
}
