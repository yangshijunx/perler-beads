import type { BeadColor, ColorMatchResult } from '@/types'

/**
 * RGB 转 LAB 颜色空间
 */
function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  let [r, g, b] = rgb

  // 首先转换为 XYZ 颜色空间
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const rLinear = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92
  const gLinear = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92
  const bLinear = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92

  const x = rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805
  const y = rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722
  const z = rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505

  // 然后转换为 LAB 颜色空间 (D65 参考白点)
  const xRef = 0.95047
  const yRef = 1.0
  const zRef = 1.08883

  const xNorm = x / xRef
  const yNorm = y / yRef
  const zNorm = z / zRef

  const fx = xNorm > 0.008856 ? Math.pow(xNorm, 1 / 3) : 7.787 * xNorm + 16 / 116
  const fy = yNorm > 0.008856 ? Math.pow(yNorm, 1 / 3) : 7.787 * yNorm + 16 / 116
  const fz = zNorm > 0.008856 ? Math.pow(zNorm, 1 / 3) : 7.787 * zNorm + 16 / 116

  const L = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bLab = 200 * (fy - fz)

  return [L, a, bLab]
}

/**
 * 计算 Delta-E (CIEDE2000) 颜色差异
 */
export function deltaE2000(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [L1, a1, b1] = rgbToLab(rgb1)
  const [L2, a2, b2] = rgbToLab(rgb2)

  // 简化的 Delta-E 计算 (使用 CIE76)
  const deltaL = L1 - L2
  const deltaA = a1 - a2
  const deltaB = b1 - b2

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB)
}

/**
 * 计算 Delta-E (CIE76) 颜色差异（更简单快速的版本）
 */
export function deltaE76(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [L1, a1, b1] = rgbToLab(rgb1)
  const [L2, a2, b2] = rgbToLab(rgb2)

  const deltaL = L1 - L2
  const deltaA = a1 - a2
  const deltaB = b1 - b2

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB)
}

/**
 * 计算欧几里得颜色距离（RGB 空间）
 */
export function rgbDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const [r1, g1, b1] = rgb1
  const [r2, g2, b2] = rgb2

  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2))
}

/**
 * 找到最接近的拼豆颜色
 */
export function findClosestColor(
  targetRgb: [number, number, number],
  colorPalette: BeadColor[],
  useDeltaE: boolean = true,
): ColorMatchResult {
  if (colorPalette.length === 0) {
    // Return a default color if palette is empty
    return {
      color: {
        id: 'default',
        name: 'Default',
        code: '00',
        rgb: [128, 128, 128],
        hex: '#808080',
        brand: 'hama',
      },
      distance: 0,
    }
  }

  let closestColor = colorPalette[0]!
  let minDistance = useDeltaE
    ? deltaE76(targetRgb, closestColor.rgb)
    : rgbDistance(targetRgb, closestColor.rgb)

  for (let i = 1; i < colorPalette.length; i++) {
    const color = colorPalette[i]!
    const distance = useDeltaE ? deltaE76(targetRgb, color.rgb) : rgbDistance(targetRgb, color.rgb)

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  return { color: closestColor, distance: minDistance }
}

/**
 * 批量匹配颜色
 */
export function matchColors(
  targetColors: [number, number, number][],
  colorPalette: BeadColor[],
  useDeltaE: boolean = true,
): ColorMatchResult[] {
  return targetColors.map((rgb) => findClosestColor(rgb, colorPalette, useDeltaE))
}

/**
 * 计算图像区域的平均颜色
 */
export function calculateAverageColor(
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number,
): [number, number, number] {
  const { data } = imageData
  let totalR = 0
  let totalG = 0
  let totalB = 0
  let count = 0

  for (let y = startY; y < startY + height && y < imageData.height; y++) {
    for (let x = startX; x < startX + width && x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4
      totalR += data[index] ?? 0
      totalG += data[index + 1] ?? 0
      totalB += data[index + 2] ?? 0
      count++
    }
  }

  return count > 0
    ? [Math.round(totalR / count), Math.round(totalG / count), Math.round(totalB / count)]
    : [255, 255, 255]
}

/**
 * 颜色量化（减少颜色数量）
 */
export function quantizeColor(
  rgb: [number, number, number],
  levels: number = 4,
): [number, number, number] {
  const step = 255 / (levels - 1)
  return [
    Math.round(Math.round(rgb[0] / step) * step),
    Math.round(Math.round(rgb[1] / step) * step),
    Math.round(Math.round(rgb[2] / step) * step),
  ]
}

/**
 * RGB 转 Hex
 */
export function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * Hex 转 RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result && result[1] && result[2] && result[3]) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
  }
  return [0, 0, 0]
}

/**
 * 调整颜色亮度
 */
export function adjustBrightness(
  rgb: [number, number, number],
  factor: number,
): [number, number, number] {
  const [r, g, b] = rgb
  return [
    Math.min(255, Math.max(0, Math.round(r * factor))),
    Math.min(255, Math.max(0, Math.round(g * factor))),
    Math.min(255, Math.max(0, Math.round(b * factor))),
  ]
}

/**
 * 调整颜色对比度
 */
export function adjustContrast(
  rgb: [number, number, number],
  factor: number,
): [number, number, number] {
  const intercept = 128 * (1 - factor)
  return [
    Math.min(255, Math.max(0, Math.round(rgb[0] * factor + intercept))),
    Math.min(255, Math.max(0, Math.round(rgb[1] * factor + intercept))),
    Math.min(255, Math.max(0, Math.round(rgb[2] * factor + intercept))),
  ]
}

/**
 * 获取颜色的补色
 */
export function getComplementaryColor(rgb: [number, number, number]): [number, number, number] {
  return [255 - rgb[0], 255 - rgb[1], 255 - rgb[2]]
}

/**
 * 判断颜色是否为深色
 */
export function isDarkColor(rgb: [number, number, number]): boolean {
  // 使用感知亮度公式
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
  return brightness < 128
}

/**
 * 获取颜色的文本颜色（黑色或白色）
 */
export function getTextColor(rgb: [number, number, number]): string {
  return isDarkColor(rgb) ? '#ffffff' : '#000000'
}

/**
 * 按色相排序颜色
 */
export function sortColorsByHue(colors: BeadColor[]): BeadColor[] {
  return [...colors].sort((a, b) => {
    const [h1] = rgbToHsl(a.rgb)
    const [h2] = rgbToHsl(b.rgb)
    return h1 - h2
  })
}

/**
 * RGB 转 HSL
 */
function rgbToHsl(rgb: [number, number, number]): [number, number, number] {
  let [r, g, b] = rgb
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s * 100, l * 100]
}

/**
 * 锐化图像（增强细节）
 */
export function sharpenImage(imageData: ImageData, strength: number = 1.0): ImageData {
  const { data, width, height } = imageData
  const copy = new Uint8ClampedArray(data)

  // 锐化卷积核
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ]

  const factor = strength

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            sum += (data[idx] ?? 0) * kernel[ky + 1]![kx + 1]!
          }
        }

        const idx = (y * width + x) * 4 + c
        const original = data[idx] ?? 0
        copy[idx] = Math.min(255, Math.max(0, original + (sum - original) * factor))
      }
    }
  }

  return new ImageData(copy, width, height)
}

/**
 * 检测边缘强度（使用 Sobel 算子）
 */
export function detectEdgeStrength(imageData: ImageData, x: number, y: number): number {
  const { data, width, height } = imageData

  if (x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1) {
    return 0
  }

  // Sobel 算子
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ]

  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ]

  let gx = 0
  let gy = 0

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = x + dx
      const py = y + dy
      const idx = (py * width + px) * 4

      // 使用灰度值
      const gray =
        (data[idx] ?? 0) * 0.299 + (data[idx + 1] ?? 0) * 0.587 + (data[idx + 2] ?? 0) * 0.114

      gx += gray * sobelX[dy + 1]![dx + 1]!
      gy += gray * sobelY[dy + 1]![dx + 1]!
    }
  }

  return Math.sqrt(gx * gx + gy * gy)
}

/**
 * 计算图像区域的加权平均颜色（考虑边缘）
 */
export function calculateWeightedAverageColor(
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number,
  edgeWeight: number = 2.0,
): [number, number, number] {
  const { data } = imageData
  let totalR = 0
  let totalG = 0
  let totalB = 0
  let totalWeight = 0

  for (let y = startY; y < startY + height && y < imageData.height; y++) {
    for (let x = startX; x < startX + width && x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4

      // 计算边缘强度
      const edgeStrength = detectEdgeStrength(imageData, x, y)
      const weight = 1 + (edgeStrength / 255) * edgeWeight

      totalR += (data[index] ?? 0) * weight
      totalG += (data[index + 1] ?? 0) * weight
      totalB += (data[index + 2] ?? 0) * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0
    ? [
        Math.round(totalR / totalWeight),
        Math.round(totalG / totalWeight),
        Math.round(totalB / totalWeight),
      ]
    : [255, 255, 255]
}

/**
 * 抖动处理 (Floyd-Steinberg)
 */
export function floydSteinbergDither(imageData: ImageData, colorPalette: BeadColor[]): ImageData {
  const { data, width, height } = imageData
  const copy = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      const oldPixel: [number, number, number] = [copy[i] ?? 0, copy[i + 1] ?? 0, copy[i + 2] ?? 0]
      const match = findClosestColor(oldPixel, colorPalette, true)
      const newPixel = match.color.rgb

      copy[i] = newPixel[0] ?? 0
      copy[i + 1] = newPixel[1] ?? 0
      copy[i + 2] = newPixel[2] ?? 0

      const quantError: [number, number, number] = [
        oldPixel[0] - (newPixel[0] ?? 0),
        oldPixel[1] - (newPixel[1] ?? 0),
        oldPixel[2] - (newPixel[2] ?? 0),
      ]

      // 分发误差到相邻像素
      const distribute = (dx: number, dy: number, factor: number) => {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 4
          copy[ni] = Math.min(255, Math.max(0, (copy[ni] ?? 0) + quantError[0] * factor))
          copy[ni + 1] = Math.min(255, Math.max(0, (copy[ni + 1] ?? 0) + quantError[1] * factor))
          copy[ni + 2] = Math.min(255, Math.max(0, (copy[ni + 2] ?? 0) + quantError[2] * factor))
        }
      }

      distribute(1, 0, 7 / 16)
      distribute(-1, 1, 3 / 16)
      distribute(0, 1, 5 / 16)
      distribute(1, 1, 1 / 16)
    }
  }

  const result = new ImageData(copy, width, height)
  return result
}
