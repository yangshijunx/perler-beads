/* eslint-disable */
declare module 'cropperjs' {
  export default class Cropper {
    constructor(element: HTMLElement, options?: any)
    rotate(degree: number): void
    zoom(ratio: number): void
    getCropperCanvas(): any
    reset(): void
    destroy(): void
    getDataURL(): string
    setAspectRatio(aspectRatio: number): Cropper
    setDragMode(dragMode: string): Cropper
    setDragMode(dragMode: any): Cropper
  }

  export interface CropperOptions {
    viewMode?: number | boolean
    dragMode?: string | any
    aspectRatio?: number
    autoCropArea?: number
    movable?: boolean
    rotatable?: boolean
    scalable?: boolean
    zoomable?: boolean
    cropBoxMovable?: boolean
    cropBoxResizable?: boolean
    toggleDragModeOnDblclick?: boolean
    background?: boolean
    modal?: boolean
    guides?: boolean
    center?: boolean
    highlight?: boolean
  }
}
