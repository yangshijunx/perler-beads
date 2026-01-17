<template>
  <div class="history-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-content">
        <h1 class="view-title">
          <span class="title-icon">📋</span>
          {{ t('history.title') }}
        </h1>
        <p class="view-subtitle">{{ t('history.noHistoryDesc') }}</p>
      </div>
      <div class="header-actions">
        <LanguageSwitcher />
        <router-link to="/" class="nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          {{ t('nav.backToEditor') }}
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- History List -->
      <div class="history-panel">
        <HistoryList
          :items="history"
          :selected-id="selectedTemplateId"
          @select="loadTemplate"
          @delete="deleteTemplate"
          @clear="clearAllHistory"
        />
      </div>

      <!-- Template Preview -->
      <div class="preview-panel">
        <div v-if="!selectedTemplateId" class="empty-selection">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3 class="empty-title">{{ t('templateGenerator.noTemplate') }}</h3>
          <p class="empty-description">{{ t('history.selectTemplate') }}</p>
        </div>

        <div v-else class="template-details">
          <div class="details-header">
            <div class="template-info">
              <h3 class="template-name">{{ selectedTemplate?.name }}</h3>
              <div class="template-meta">
                <span>{{ selectedTemplate?.width }} × {{ selectedTemplate?.height }} {{ t('sizeSelector.beadSize') }}</span>
                <span>•</span>
                <span>{{ t('beadSizes.' + selectedTemplate?.beadSize) }}</span>
                <span>•</span>
                <span>{{ t('brands.' + selectedTemplate?.brand) }}</span>
                <span>•</span>
                <span>{{ selectedTemplate?.totalPages }} {{ t('history.page', { current: 1, total: selectedTemplate?.totalPages || 1 }) }}</span>
              </div>
            </div>
            <div class="template-actions">
              <button @click="editTemplate" class="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                {{ t('common.edit') }}
              </button>
              <button @click="exportTemplate" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {{ t('common.export') }}
              </button>
            </div>
          </div>

          <div class="template-preview">
            <img :src="selectedTemplate?.imageData" :alt="selectedTemplate?.name" class="preview-image">
          </div>

          <div class="color-stats">
            <h4 class="stats-title">{{ t('history.colorStatistics') }}</h4>
            <div class="stats-grid">
              <div
                v-for="[colorId, count] in sortedColorCounts"
                :key="colorId"
                class="stat-item"
              >
                <span
                  class="stat-color"
                  :style="{ background: getColorById(colorId)?.hex }"
                ></span>
                <span class="stat-code">{{ getColorById(colorId)?.code }}</span>
                <span class="stat-count">×{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePerlerStore } from '@/stores/perlerStore'
import HistoryList from '@/components/HistoryList.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { getColorById } from '@/assets/data/beadColors'

const { t } = useI18n()

const router = useRouter()
const store = usePerlerStore()

const selectedTemplateId = ref<string | null>(null)

const history = computed(() => store.history)
const selectedTemplate = computed(() => {
  if (!selectedTemplateId.value) return null
  return store.loadTemplate(selectedTemplateId.value)
})

const sortedColorCounts = computed(() => {
  if (!selectedTemplate.value) return []
  return Array.from(selectedTemplate.value.colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
})

const loadTemplate = (id: string) => {
  selectedTemplateId.value = id
  store.loadTemplate(id)
}

const deleteTemplate = (id: string) => {
  if (confirm(t('history.confirmDelete'))) {
    store.deleteTemplate(id)
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = null
    }
  }
}

const clearAllHistory = () => {
  if (confirm(t('history.confirmClearAll'))) {
    store.clearAllHistory()
    selectedTemplateId.value = null
  }
}

const editTemplate = () => {
  if (selectedTemplateId.value) {
    router.push('/')
  }
}

const exportTemplate = () => {
  if (!selectedTemplate.value) return

  // 导出模板数据为 JSON
  const data = JSON.stringify(selectedTemplate.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedTemplate.value.name}_template.json`
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="scss">
.history-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f8 0%, #fff0f5 100%);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  flex: 1;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.title-icon {
  font-size: 2rem;
}

.view-subtitle {
  font-size: 1rem;
  color: #999;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b9d;
    color: #ff6b9d;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.history-panel {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-panel {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 500px;
}

.empty-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-icon {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #999;
}

.template-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.template-meta {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.template-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
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
}

.template-preview {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-stats {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.stat-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.stat-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.stat-count {
  font-size: 0.75rem;
  color: #666;
  margin-left: auto;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .history-panel {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .view-title {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 1rem;
  }

  .details-header {
    flex-direction: column;
    gap: 1rem;
  }

  .template-actions {
    width: 100%;
    justify-content: stretch;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
