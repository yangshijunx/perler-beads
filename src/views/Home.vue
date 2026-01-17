<template>
  <div class="home-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-content">
        <h1 class="view-title">
          <span class="title-icon">✨</span>
          {{ t('home.title') }}
        </h1>
        <p class="view-subtitle">{{ t('home.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <LanguageSwitcher />
        <router-link to="/history" class="nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ t('nav.history') }}
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel: Controls -->
      <div class="control-panel">
        <div class="panel-section">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            {{ t('home.section1') }}
          </h2>
          <ImageUploader v-model="uploadedImage" @change="handleImageChange" />
        </div>

        <div class="panel-section">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m5.25-12.75l-5.196 3m3.464 3.464l5.196 3M1 12h6m6 0h6m-12.75-5.25l3-5.196m3.464 3.464l3 5.196"></path>
            </svg>
            {{ t('home.section2') }}
          </h2>

          <SizeSelector v-model="processingOptions" />

          <div class="setting-group">
            <label class="setting-label">{{ t('brands.' + selectedBrand) }}</label>
            <ColorPalette v-model="selectedBrand" compact />
          </div>

          <div class="setting-group">
            <label class="setting-label">{{ t('settings.advancedOptions') }}</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="processingOptions.dithering">
                {{ t('settings.enableDithering') }}
              </label>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {{ t('home.section3') }}
          </h2>
          <button
            @click="generateTemplate"
            :disabled="!uploadedImage || isProcessing"
            class="btn-generate"
          >
            <span v-if="!isProcessing">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              {{ t('processing.generate') }}
            </span>
            <span v-else class="processing-spinner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              {{ t('processing.generating') }} {{ processingProgress }}%
            </span>
          </button>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="preview-panel">
        <TemplateGenerator :template-data="currentTemplate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePerlerStore } from '@/stores/perlerStore'
import { useImageProcessor } from '@/composables/useImageProcessor'
import ImageUploader from '@/components/ImageUploader.vue'
import SizeSelector from '@/components/SizeSelector.vue'
import ColorPalette from '@/components/ColorPalette.vue'
import TemplateGenerator from '@/components/TemplateGenerator.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import type { ImageProcessOptions, BeadBrand } from '@/types'
import { getColorPalette } from '@/assets/data/beadColors'

const { t } = useI18n()
const router = useRouter()
const store = usePerlerStore()
const { processImage, isProcessing, progress: processingProgress } = useImageProcessor()

const uploadedImage = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const selectedBrand = ref<BeadBrand>('hama')

const processingOptions = ref<ImageProcessOptions>({
  width: 50,
  height: 50,
  beadSize: 'regular',
  brand: 'hama',
  dithering: false,
  contrast: 1,
  brightness: 1
})

const currentTemplate = computed(() => store.currentTemplate)

const handleImageChange = (file: File) => {
  imageFile.value = file
  store.setCurrentTemplate(null)
}

const generateTemplate = async () => {
  if (!imageFile.value) {
    console.warn('No image file selected')
    return
  }

  console.log('Starting template generation with options:', processingOptions.value)
  store.setProcessingState(true, 0)

  try {
    // 更新处理选项
    processingOptions.value.brand = selectedBrand.value

    // 获取颜色板
    const colorPalette = getColorPalette(selectedBrand.value)
    console.log('Color palette loaded:', colorPalette.length, 'colors')

    // 处理图片
    const template = await processImage(imageFile.value, processingOptions.value, colorPalette)

    console.log('Template generated successfully:', template)
    // 设置当前模板
    store.setCurrentTemplate(template)
  } catch (error) {
    console.error('Failed to generate template:', error)
    alert(t('errors.failedToGenerate') + ': ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    console.log('Processing complete, resetting state')
    store.setProcessingState(false, 0)
  }
}
</script>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f8 0%, #fff0f5 100%);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  min-height: 60px;
}

.header-content {
  flex: 1;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
}

.view-subtitle {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b9d;
    color: #ff6b9d;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  padding: 2rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 107, 157, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 107, 157, 0.4);
    }
  }
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #ff6b9d;
  }
}

.btn-generate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 157, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.processing-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.preview-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .control-panel {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    overflow-y: visible;
  }
}

@media (max-width: 640px) {
  .home-view {
    height: auto;
    min-height: 100vh;
  }

  .view-header {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    min-height: auto;
  }

  .view-title {
    font-size: 1.125rem;
  }

  .title-icon {
    font-size: 1.25rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .main-content {
    padding: 1rem;
    overflow: visible;
  }

  .panel-section {
    padding: 1rem;
  }

  .control-panel {
    overflow-y: visible;
  }
}
</style>
