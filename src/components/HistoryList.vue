<template>
  <div class="history-list">
    <div class="history-header">
      <h3 class="history-title">{{ t('history.title') }}</h3>
      <button v-if="items.length > 0" @click="clearAll" class="btn-clear">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        {{ t('history.clearAll') }}
      </button>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <p class="empty-text">{{ t('history.noHistory') }}</p>
    </div>

    <div v-else class="history-items">
      <div
        v-for="item in sortedItems"
        :key="item.id"
        :class="['history-item', { 'selected': selectedId === item.id }]"
        @click="selectItem(item.id)"
      >
        <div class="item-thumbnail">
          <img :src="item.thumbnail" :alt="item.name">
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">
            <span>{{ item.width }}×{{ item.height }}</span>
            <span>•</span>
            <span>{{ item.beadSize }}</span>
            <span>•</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
        <button @click.stop="deleteItem(item.id)" class="btn-delete" :title="t('history.delete')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HistoryItem } from '@/types'

const { t } = useI18n()

interface Props {
  items: HistoryItem[]
  selectedId?: string | null
}

interface Emits {
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null
})

const emit = defineEmits<Emits>()

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const selectItem = (id: string) => {
  emit('select', id)
}

const deleteItem = (id: string) => {
  emit('delete', id)
}

const clearAll = () => {
  emit('clear')
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return t('history.today')
  } else if (diffDays === 1) {
    return t('history.yesterday')
  } else if (diffDays < 7) {
    return t('history.daysAgo', { days: diffDays })
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return t('history.weeksAgo', { weeks, s: weeks > 1 ? 's' : '' })
  } else {
    return d.toLocaleDateString()
  }
}
</script>

<style scoped lang="scss">
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  background: #ffebee;
  color: #f44336;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ffcdd2;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.empty-icon {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  color: #999;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 107, 157, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.selected {
    border-color: #ff6b9d;
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  }
}

.item-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 0.75rem;
  color: #999;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #ffebee;
    color: #f44336;
  }
}

@media (max-width: 640px) {
  .history-items {
    max-height: 300px;
  }

  .item-thumbnail {
    width: 50px;
    height: 50px;
  }
}
</style>
