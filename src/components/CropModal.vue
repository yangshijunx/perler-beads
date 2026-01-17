<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ t('imageUploader.cropImage') }}</h3>
            <button @click="close" class="btn-close">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="cropper-wrapper" ref="cropperWrapper">
              <img
                v-if="imageUrl"
                ref="cropperImage"
                :src="imageUrl"
                alt="Crop"
                class="cropper-image"
              />
            </div>
          </div>

          <div class="modal-footer">
            <div class="control-group">
              <button
                @click="rotateLeft"
                class="btn btn-secondary"
                :title="t('imageUploader.rotateLeft')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button
                @click="rotateRight"
                class="btn btn-secondary"
                :title="t('imageUploader.rotateRight')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                </svg>
              </button>
              <button @click="zoomIn" class="btn btn-secondary" :title="t('imageUploader.zoomIn')">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button
                @click="zoomOut"
                class="btn btn-secondary"
                :title="t('imageUploader.zoomOut')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
            </div>
            <div class="action-group">
              <button @click="cancel" class="btn btn-secondary">
                {{ t('imageUploader.cancel') }}
              </button>
              <button @click="apply" class="btn btn-primary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ t('imageUploader.apply') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Cropper from 'cropperjs'

interface Props {
  show: boolean
  imageUrl: string | null
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'apply', result: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const cropperWrapper = ref<HTMLElement | null>(null)
const cropperImage = ref<HTMLImageElement | null>(null)
let cropper: any = null // Use any to avoid type issues

const initCropper = () => {
  if (!cropperWrapper.value || !cropperImage.value || !props.imageUrl) return

  // 销毁旧的cropper实例
  if (cropper) {
    cropper.destroy()
  }

  console.log('Initializing cropper...')

  // 创建新的cropper实例
  cropper = new Cropper(cropperImage.value, {
    viewMode: 1,
    dragMode: 'crop',
    aspectRatio: NaN,
    autoCropArea: 1,
    movable: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: true,
    background: false,
    modal: true,
    guides: true,
    center: true,
    highlight: true,
  })

  console.log('Cropper instance created')
}

watch(
  () => props.show,
  async (newValue) => {
    if (newValue && props.imageUrl) {
      console.log('Modal opened with imageUrl:', props.imageUrl.substring(0, 50) + '...')
      await nextTick()

      // 等待DOM更新后初始化cropper
      setTimeout(() => {
        initCropper()
      }, 100)
    }
  },
)

onMounted(() => {
  console.log('CropModal mounted')
})

onBeforeUnmount(() => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
})

const handleOverlayClick = () => {
  cancel()
}

const rotateLeft = () => {
  if (cropper) {
    cropper.rotate(-90)
  }
}

const rotateRight = () => {
  if (cropper) {
    cropper.rotate(90)
  }
}

const zoomIn = () => {
  if (cropper) {
    cropper.zoom(0.1)
  }
}

const zoomOut = () => {
  if (cropper) {
    cropper.zoom(-0.1)
  }
}

const apply = () => {
  if (!cropper) return

  try {
    console.log('Getting cropped canvas...')
    const canvas = cropper.getCropperCanvas()
    console.log('Canvas size:', canvas?.width, 'x', canvas?.height)

    if (canvas) {
      const result = canvas.toDataURL('image/png')
      console.log('Cropped image length:', result.length)
      emit('apply', result)
      close()
    }
  } catch (e) {
    console.error('Crop failed:', e)
    alert(t('errors.failedToGenerate'))
  }
}

const cancel = () => {
  close()
}

const close = () => {
  emit('update:show', false)
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font_count-weight: 600;
  color: #333;
  margin: 0;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
}

.modal-body {
  height: 70vh;
  min-height: 500px;
  overflow: hidden;
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-image {
  display: block;
  width: auto;
  height: 80%;
  max-width: 100%;
  object-fit: contain;
  margin: 0 auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }

  &.btn-primary {
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
    color: white;

    &:hover {
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
    }
  }

  &.btn-secondary {
    background: #f5f5f5;
    color: #333;

    &:hover {
      background: #e0e0e0;
    }
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-overlay {
    opacity: 1;
  }

  .modal-container {
    transform: scale(1);
  }
}

.modal-enter-from,
.modal-leave-to {
  .modal-overlay {
    opacity: 0;
  }

  .modal-container {
    transform: scale(0.9);
  }
}

.modal-container {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .modal-container {
    max-width: 95vw;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .control-group,
  .action-group {
    width: 100%;
    justify-content: center;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
