<template>
  <div class="image-uploader">
    <div
      v-if="!imageUrl"
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @click="selectFile"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @dragenter.prevent
    >
      <div class="upload-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <div class="upload-text">
        <p class="upload-title">{{ t('imageUploader.title') }}</p>
        <p class="upload-subtitle">{{ t('imageUploader.subtitle') }}</p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden-input"
      />
    </div>

    <div v-else class="preview-area">
      <div class="preview-container">
        <img :src="imageUrl" alt="Preview" class="preview-image" />
      </div>

      <div class="preview-controls">
        <!-- <button @click="openCropModal" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
            <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
          </svg>
          {{ t('imageUploader.cropImage') }}
        </button> -->
        <button @click="clearImage" class="btn btn-danger">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
          </svg>
          {{ t('imageUploader.clear') }}
        </button>
      </div>
    </div>

    <!-- Crop Modal -->
    <CropModal
      :show="showCropModal"
      :image-url="imageUrl"
      @update:show="showCropModal = $event"
      @apply="handleCropResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CropModal from './CropModal.vue'

interface Props {
  modelValue: string | null
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', file: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref<string | null>(props.modelValue)
const isDragOver = ref(false)
const showCropModal = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    imageUrl.value = newValue
  },
)

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    loadFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.type.startsWith('image/')) {
      loadFile(file)
    }
  }
}

const loadFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    emit('update:modelValue', imageUrl.value)
    emit('change', file)
  }
  reader.readAsDataURL(file)
}

const openCropModal = () => {
  showCropModal.value = true
}

const handleCropResult = (result: string) => {
  imageUrl.value = result
  emit('update:modelValue', imageUrl.value)
}

const clearImage = () => {
  imageUrl.value = null
  emit('update:modelValue', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped lang="scss">
.image-uploader {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 1.5rem;
  border: 2px dashed #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff6b9d;
    background: rgba(255, 107, 157, 0.05);
  }

  &.drag-over {
    border-color: #ff6b9d;
    background: rgba(255, 107, 157, 0.1);
  }
}

.upload-icon {
  color: #ccc;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;

  svg {
    width: 48px;
    height: 48px;
  }
}

.upload-area:hover .upload-icon {
  color: #ff6b9d;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.4rem;
}

.upload-subtitle {
  font-size: 0.8rem;
  color: #999;
}

.hidden-input {
  display: none;
}

.preview-area {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.preview-container {
  position: relative;
  min-height: 200px;
  max-height: 300px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.preview-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #e0e0e0;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

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

  &.btn-danger {
    background: #ffebee;
    color: #f44336;

    &:hover {
      background: #ffcdd2;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 640px) {
  .preview-controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
