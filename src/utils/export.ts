import type { TemplateData, ExportOptions, PrintOptions, PageInfo } from '@/types'
import { canvasToBlob, downloadCanvas } from './canvas'

/**
 * 导出为 PNG 图片
 */
export async function exportAsPNG(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  downloadCanvas(canvas, filename, 'image/png')
}

/**
 * 导出为 JPEG 图片
 */
export async function exportAsJPEG(
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number = 0.92
): Promise<void> {
  downloadCanvas(canvas, filename, 'image/jpeg')
}

/**
 * 导出模板数据为 JSON
 */
export function exportAsJSON(templateData: TemplateData, filename: string): void {
  const json = JSON.stringify(templateData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * 导入模板数据从 JSON
 */
export function importFromJSON(file: File): Promise<TemplateData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // 恢复日期对象
        data.createdAt = new Date(data.createdAt)
        // 恢复 Map 对象
        if (data.colorCounts && Array.isArray(data.colorCounts)) {
          data.colorCounts = new Map(data.colorCounts)
        }
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse JSON file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * 生成多页 PDF (使用 jsPDF 风格的简化实现)
 */
export async function exportAsPDF(
  canvases: HTMLCanvasElement[],
  filename: string
): Promise<void> {
  // 这里使用简化的 PDF 导出 - 将所有页面合并为一张长图
  // 实际项目中可以使用 jsPDF 库来实现真正的 PDF 导出

  if (canvases.length === 0) return

  const totalPages = canvases.length
  const firstCanvas = canvases[0]
  if (!firstCanvas) return

  const { width, height } = firstCanvas

  // 创建包含所有页面的画布
  const combinedCanvas = document.createElement('canvas')
  const margin = 50
  combinedCanvas.width = width + margin * 2
  combinedCanvas.height = height * totalPages + margin * (totalPages + 1) + 100

  const ctx = combinedCanvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  // 白色背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

  let currentY = margin

  canvases.forEach((canvas, index) => {
    // 绘制页面
    ctx.drawImage(canvas, margin, currentY)

    // 绘制页码
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      `Page ${index + 1} of ${totalPages}`,
      combinedCanvas.width / 2,
      currentY + height + margin / 2
    )

    currentY += height + margin
  })

  // 导出为 PNG (用户可以打印为 PDF)
  downloadCanvas(combinedCanvas, filename.replace('.pdf', '.png'), 'image/png')
}

/**
 * 打印模板
 */
export function printTemplate(canvas: HTMLCanvasElement, options: PrintOptions): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.')
  }

  const document = printWindow.document
  document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Perler Bead Template</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            @page {
              size: ${options.paperSize};
              margin: ${options.margin}mm;
            }
          }

          .print-header {
            text-align: center;
            padding: 10px;
            margin-bottom: 10px;
            border-bottom: 2px solid #333;
          }

          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }

          .print-info {
            font-size: 12px;
            color: #666;
          }

          .template-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 20px;
          }

          .template-page {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .template-page:last-child {
            page-break-after: auto;
          }

          .template-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #ccc;
          }

          .color-legend {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          .color-legend h3 {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .color-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
            font-size: 12px;
          }

          .color-swatch {
            width: 20px;
            height: 20px;
            border: 1px solid #333;
            border-radius: 3px;
          }

          .print-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 10px;
          }

          .print-controls button {
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
          }

          .print-controls button:hover {
            background: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="print-controls no-print">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>

        <div class="template-container">
          <div class="print-header">
            <h1>Perler Bead Template</h1>
            <p class="print-info">
              Generated on ${new Date().toLocaleDateString()} |
              Paper: ${options.paperSize} |
              DPI: ${options.dpi}
            </p>
          </div>

          <div class="template-page">
            <img class="template-image" src="${canvas.toDataURL('image/png')}" alt="Perler Bead Template">
          </div>
        </div>

        <script>
          // 自动打印
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };

          // 打印后关闭窗口
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `)
  document.close()
}

/**
 * 打印多页模板
 */
export function printMultiplePages(
  canvases: HTMLCanvasElement[],
  pageInfo: PageInfo[],
  options: PrintOptions
): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.')
  }

  const document = printWindow.document
  const pagesHtml = canvases.map((canvas, index) => {
    const info = pageInfo[index]
    if (!info) return ''

    return `
      <div class="template-page">
        <div class="page-info">
          Page ${info.pageNumber} of ${info.totalPages} |
          Rows ${info.startRow + 1}-${info.endRow + 1} |
          Cols ${info.startCol + 1}-${info.endCol + 1}
        </div>
        <img class="template-image" src="${canvas.toDataURL('image/png')}" alt="Page ${info.pageNumber}">
      </div>
    `
  }).join('')

  document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Perler Bead Template (Multiple Pages)</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            @page {
              size: ${options.paperSize};
              margin: ${options.margin}mm;
            }
          }

          .print-header {
            text-align: center;
            padding: 10px;
            margin-bottom: 10px;
            border-bottom: 2px solid #333;
          }

          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }

          .template-page {
            page-break-after: always;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
          }

          .template-page:last-child {
            page-break-after: auto;
          }

          .page-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-align: center;
          }

          .template-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #ccc;
          }

          .print-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 10px;
            z-index: 1000;
          }

          .print-controls button {
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
          }

          .print-controls button:hover {
            background: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="print-controls no-print">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>

        <div class="print-header">
          <h1>Perler Bead Template</h1>
          <p class="print-info">
            Generated on ${new Date().toLocaleDateString()} |
            Total Pages: ${canvases.length} |
            Paper: ${options.paperSize}
          </p>
        </div>

        ${pagesHtml}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };

          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `)
  document.close()
}

/**
 * 下载所有页面为单个文件
 */
export async function downloadAllPages(
  canvases: HTMLCanvasElement[],
  filename: string,
  format: 'png' | 'pdf' = 'png'
): Promise<void> {
  if (format === 'pdf') {
    await exportAsPDF(canvases, filename)
  } else {
    // 导出为 PNG（所有页面合并）
    await exportAsPDF(canvases, filename)
  }
}

/**
 * 分享模板（生成分享链接）
 */
export function generateShareLink(templateData: TemplateData): string {
  // 将模板数据压缩并编码为 URL
  const json = JSON.stringify(templateData)
  const compressed = btoa(encodeURIComponent(json))
  return `${window.location.origin}${window.location.pathname}#share=${compressed}`
}

/**
 * 从分享链接加载模板
 */
export function loadFromShareLink(): TemplateData | null {
  const hash = window.location.hash
  const shareMatch = hash.match(/share=(.+)/)

  if (shareMatch && shareMatch[1]) {
    try {
      const decompressed = decodeURIComponent(atob(shareMatch[1]))
      const data = JSON.parse(decompressed)
      data.createdAt = new Date(data.createdAt)
      if (data.colorCounts && Array.isArray(data.colorCounts)) {
        data.colorCounts = new Map(data.colorCounts)
      }
      return data
    } catch {
      return null
    }
  }

  return null
}

/**
 * 清除分享链接
 */
export function clearShareLink(): void {
  if (window.location.hash.includes('share=')) {
    window.history.replaceState(null, '', window.location.pathname)
  }
}
