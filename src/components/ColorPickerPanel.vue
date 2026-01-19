<template>
  <div class="color-picker-panel">
    <div class="panel-header">
      <h3>{{ t('editor.selectColor') }}</h3>
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('editor.searchColor')"
          class="search-input"
        />
      </div>
    </div>

    <div class="color-grid">
      <div
        v-for="color in filteredColors"
        :key="color.id"
        class="color-item"
        :class="{ selected: selectedColor?.id === color.id }"
        :style="{ backgroundColor: color.hex }"
        :title="`${color.name} (${color.code})`"
        @click="selectColor(color)"
      >
        <div class="color-info">
          <span class="color-code">{{ color.code }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedColor" class="selected-color-info">
      <div class="info-row">
        <div class="color-preview" :style="{ backgroundColor: selectedColor.hex }"></div>
        <div class="color-details">
          <div class="color-name">{{ selectedColor.name }}</div>
          <div class="color-code-detail">{{ selectedColor.code }}</div>
          <div class="color-rgb">RGB: {{ selectedColor.rgb.join(', ') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BeadColor } from '@/types'

const { t } = useI18n()

interface Props {
  colors: BeadColor[]
  selectedColor?: BeadColor | null
}

interface Emits {
  (e: 'select', color: BeadColor): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')

const filteredColors = computed(() => {
  if (!searchQuery.value) {
    return props.colors
  }

  const query = searchQuery.value.toLowerCase()
  return props.colors.filter(
    (color) => color.name.toLowerCase().includes(query) || color.code.toLowerCase().includes(query),
  )
})

const selectColor = (color: BeadColor) => {
  emit('select', color)
}
</script>

<style scoped>
.color-picker-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.search-box {
  margin-top: 8px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4caf50;
}

.color-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  padding: 16px;
  overflow-y: auto;
  max-height: 400px;
}

.color-item {
  aspect-ratio: 1;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4px;
}

.color-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-item.selected {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
}

.color-info {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  color: #333;
}

.selected-color-info {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.info-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #ddd;
  flex-shrink: 0;
}

.color-details {
  flex: 1;
}

.color-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.color-code-detail {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.color-rgb {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}
</style>
