import { ref, computed } from 'vue'
import type {
  PixelInfo,
  ImageProcessOptions,
  TemplateData,
  BeadColor,
  CanvasDrawOptions
} from '@/types'
import { BEAD_SIZE_SPECS } from '@/types'
import { createOffscreenCanvas, drawBeadCell, drawSquareCell } from '@/utils/canvas'
import { calculateAverageColor, findClosestColor, floydSteinbergDither } from '@/utils/color'

export function useImageProcessor() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  /**
   * 加载图片文件
   */
  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * 将图片绘制到 Canvas
   */
  const imageToCanvas = (
    img: HTMLImageElement,
    maxWidth?: number,
    maxHeight?: number
  ): HTMLCanvasElement => {
    let width = img.width
    let height = img.height

    // 调整尺寸
    if (maxWidth || maxHeight) {
      const scale = Math.min(
        maxWidth ? maxWidth / width : 1,
        maxHeight ? maxHeight / height : 1
      )
      width = Math.floor(width * scale)
      height = Math.floor(height * scale)
    }

    const canvas = createOffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    ctx.drawImage(img, 0, 0, width, height)
    return canvas
  }

  /**
   * 像素化处理
   */
  const pixelateImage = (
    canvas: HTMLCanvasElement,
    options: ImageProcessOptions
  ): PixelInfo[][] => {
    isProcessing.value = true
    progress.value = 0
    error.value = null

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const beadDiameter = BEAD_SIZE_SPECS[options.beadSize]

      // 计算网格尺寸
      const gridWidth = options.width || Math.floor(canvas.width / beadDiameter)
      const gridHeight = options.height || Math.floor(canvas.height / beadDiameter)

      // 计算每个网格单元的像素大小
      const cellPixelWidth = Math.floor(canvas.width / gridWidth)
      const cellPixelHeight = Math.floor(canvas.height / gridHeight)

      const pixels: PixelInfo[][] = []

      // 获取颜色板
      const getColorByBrand = (brand: string): BeadColor => {
        // 这里应该从颜色板中获取，暂时返回默认值
        return {
          id: 'default',
          name: 'Default',
          code: '00',
          rgb: [128, 128, 128],
          hex: '#808080',
          brand: options.brand
        }
      }

      // 处理每个网格单元
      for (let row = 0; row < gridHeight; row++) {
        const rowPixels: PixelInfo[] = []
        pixels.push(rowPixels)

        for (let col = 0; col < gridWidth; col++) {
          const startX = col * cellPixelWidth
          const startY = row * cellPixelHeight

          // 计算平均颜色
          const avgColor = calculateAverageColor(
            imageData,
            startX,
            startY,
            cellPixelWidth,
            cellPixelHeight
          )

          // 这里应该匹配到拼豆色系
          const beadColor = getColorByBrand(options.brand)

          const pixelInfo: PixelInfo = {
            row,
            col,
            color: beadColor,
            originalColor: avgColor
          }
          rowPixels.push(pixelInfo)
        }

        progress.value = Math.round(((row + 1) / gridHeight) * 100)
      }

      return pixels
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Image processing failed'
      throw e
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 处理图片并生成模板数据
   */
  const processImage = async (
    file: File,
    options: ImageProcessOptions,
    colorPalette: BeadColor[]
  ): Promise<TemplateData> => {
    isProcessing.value = true
    progress.value = 0
    error.value = null

    try {
      // 加载图片
      progress.value = 10
      const img = await loadImage(file)

      // 转换为 Canvas
      progress.value = 30
      const canvas = imageToCanvas(img)

      // 获取图像数据
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // 应用抖动处理（如果启用）
      let processedImageData = imageData
      if (options.dithering) {
        progress.value = 40
        processedImageData = floydSteinbergDither(imageData, colorPalette)
      }

      // 计算网格尺寸
      const beadDiameter = BEAD_SIZE_SPECS[options.beadSize]
      const gridWidth = options.width || Math.floor(canvas.width / beadDiameter)
      const gridHeight = options.height || Math.floor(canvas.height / beadDiameter)

      // 计算每个网格单元的像素大小
      const cellPixelWidth = Math.floor(canvas.width / gridWidth)
      const cellPixelHeight = Math.floor(canvas.height / gridHeight)

      const pixels: PixelInfo[][] = []
      const colorCounts = new Map<string, number>()

      // 处理每个网格单元
      for (let row = 0; row < gridHeight; row++) {
        const rowPixels: PixelInfo[] = []
        pixels.push(rowPixels)

        for (let col = 0; col < gridWidth; col++) {
          const startX = col * cellPixelWidth
          const startY = row * cellPixelHeight

          // 计算平均颜色
          const avgColor = calculateAverageColor(
            processedImageData,
            startX,
            startY,
            cellPixelWidth,
            cellPixelHeight
          )

          // 匹配到拼豆色系
          const match = findClosestColor(avgColor, colorPalette, true)

          // 更新颜色统计
          colorCounts.set(match.color.id, (colorCounts.get(match.color.id) || 0) + 1)

          const pixelInfo: PixelInfo = {
            row,
            col,
            color: match.color,
            originalColor: avgColor
          }
          rowPixels.push(pixelInfo)
        }

        progress.value = 40 + Math.round(((row + 1) / gridHeight) * 50)
      }

      // 计算总页数（A4纸）
      const a4GridSize = {
        rows: Math.floor((1123 - 40) / beadDiameter),
        cols: Math.floor((794 - 40) / beadDiameter)
      }
      const totalPages = Math.ceil(gridHeight / a4GridSize.rows) *
                        Math.ceil(gridWidth / a4GridSize.cols)

      progress.value = 100

      return {
        id: `template_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        createdAt: new Date(),
        imageData: canvas.toDataURL('image/png'),
        width: gridWidth,
        height: gridHeight,
        beadSize: options.beadSize,
        brand: options.brand,
        pixels,
        colorCounts,
        totalPages
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Image processing failed'
      throw e
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 渲染模板到 Canvas
   */
  const renderTemplate = (
    pixels: PixelInfo[][],
    options: CanvasDrawOptions
  ): HTMLCanvasElement => {
    const rows = pixels.length
    const cols = pixels[0]?.length || 0

    const canvas = createOffscreenCanvas(
      cols * options.cellSize,
      rows * options.cellSize
    )
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // 绘制背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制每个像素
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pixel = pixels[row]?.[col]
        if (!pixel) continue

        const x = col * options.cellSize
        const y = row * options.cellSize

        if (options.showColors) {
          drawSquareCell(
            ctx,
            x,
            y,
            options.cellSize,
            pixel.color.hex,
            options.showGrid
          )
        } else {
          // 只显示网格
          ctx.strokeStyle = '#cccccc'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, options.cellSize, options.cellSize)
        }
      }
    }

    // 绘制数字
    if (options.showNumbers) {
      ctx.fillStyle = '#333333'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixel = pixels[row]?.[col]
          if (!pixel) continue

          const x = col * options.cellSize + options.cellSize / 2
          const y = row * options.cellSize + options.cellSize / 2

          // 显示颜色代码
          ctx.fillText(pixel.color.code, x, y)
        }
      }
    }

    return canvas
  }

  /**
   * 生成缩略图
   */
  const generateThumbnail = (
    templateData: TemplateData,
    maxSize: number = 200
  ): string => {
    const canvas = renderTemplate(templateData.pixels, {
      showGrid: true,
      showNumbers: false,
      showColors: true,
      cellSize: Math.min(
        maxSize / templateData.width,
        maxSize / templateData.height
      )
    })

    return canvas.toDataURL('image/png')
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置处理状态
   */
  const reset = () => {
    isProcessing.value = false
    progress.value = 0
    error.value = null
  }

  return {
    isProcessing,
    progress,
    error,
    loadImage,
    imageToCanvas,
    pixelateImage,
    processImage,
    renderTemplate,
    generateThumbnail,
    clearError,
    reset
  }
}
