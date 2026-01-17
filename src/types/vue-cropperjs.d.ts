declare module 'vue-cropperjs' {
  import { DefineComponent } from 'vue'

  export default class VueCropper extends DefineComponent<{
    src?: string
    alt?: string
    aspectRatio?: number
    viewMode?: number
    autoCropArea?: number
    movable?: boolean
    rotatable?: boolean
    scalable?: boolean
    zoomable?: boolean
    cropBoxMovable?: boolean
    cropBoxResizable?: boolean
  }> {
    rotate(degree: number): void
    relativeZoom(delta: number): void
    getCroppedCanvas(options?: { maxWidth?: number; maxHeight?: number; minWidth?: number; minHeight?: number; filledColor?: string }): HTMLCanvasElement | undefined
    reset(): void
    clear(): void
    replace(url: string): void
    enable(): void
    disable(): void
    destroy(): void
    move(offsetX: number, offsetY: number): void
    zoomTo(ratio: number): void
    scale(scaleX: number, scaleY?: number): void
    getData(round?: boolean): Record<string, unknown> | undefined
    setData(data: Record<string, unknown>): void
    getContainerData(): Record<string, unknown> | undefined
    getImageData(): Record<string, unknown> | undefined
    getCanvasData(): Record<string, unknown> | undefined
    setCanvasData(data: Record<string, unknown>): void
  }
}
