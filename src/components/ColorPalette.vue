<template>
  <div class="color-palette">
    <div class="palette-header">
      <h3 class="palette-title">{{ t('colorPalette.title') }}</h3>
      <div class="brand-selector">
        <button
          v-for="brand in brands"
          :key="brand.value"
          :class="['brand-btn', { active: modelValue === brand.value }]"
          @click="selectBrand(brand.value)"
        >
          {{ t('brands.' + brand.value) }}
        </button>
      </div>
    </div>

    <div class="palette-content">
      <div class="palette-info">
        <span class="color-count">{{ t('colorPalette.colorsAvailable', { count: colors.length }) }}</span>
      </div>

      <div class="color-grid" :class="{ 'compact': compact }">
        <div
          v-for="color in colors"
          :key="color.id"
          :class="['color-item', { 'selected': selectedColor === color.id }]"
          :style="{ '--bead-color': color.hex }"
          @click="selectColor(color.id)"
          :title="`${color.name} (${color.code})`"
        >
          <span class="color-preview"></span>
          <span v-if="!compact" class="color-code">{{ color.code }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedColorData" class="selected-color-info">
      <div class="color-preview-large" :style="{ background: selectedColorData.hex }"></div>
      <div class="color-details">
        <div class="color-name">{{ selectedColorData.name }}</div>
        <div class="color-meta">
          <span class="color-code-large">{{ t('colorPalette.code') }}: {{ selectedColorData.code }}</span>
          <span class="color-brand">{{ t('colorPalette.brand') }}: {{ t('brands.' + selectedColorData.brand) }}</span>
        </div>
        <div class="color-rgb">RGB: {{ selectedColorData.rgb.join(', ') }}</div>
        <div class="color-hex">HEX: {{ selectedColorData.hex }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BeadBrand, BeadColor } from '@/types'
import { getColorPalette } from '@/assets/data/beadColors'

interface Props {
  modelValue: BeadBrand
  compact?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: BeadBrand): void
  (e: 'colorSelect', color: BeadColor): void
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const brands = [
  { value: 'hama' as BeadBrand, label: 'hama' },
  { value: 'perler' as BeadBrand, label: 'perler' },
  { value: 'artkal' as BeadBrand, label: 'artkal' }
]

const selectedColor = ref<string | null>(null)

const colors = computed(() => getColorPalette(props.modelValue))

const selectedColorData = computed(() => {
  if (!selectedColor.value) return null
  return colors.value.find(c => c.id === selectedColor.value) || null
})

const selectBrand = (brand: BeadBrand) => {
  emit('update:modelValue', brand)
  selectedColor.value = null
}

const selectColor = (colorId: string) => {
  selectedColor.value = colorId
  const color = colors.value.find(c => c.id === colorId)
  if (color) {
    emit('colorSelect', color)
  }
}
</script>

<style scoped lang="scss">
.color-palette {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palette-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.palette-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.brand-selector {
  display: flex;
  gap: 0.5rem;
}

.brand-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b9d;
    background: rgba(255, 107, 157, 0.05);
  }

  &.active {
    border-color: #ff6b9d;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
    color: white;
  }
}

.palette-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palette-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-count {
  font-size: 0.875rem;
  color: #666;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;

  &.compact {
    grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  }
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;

  &:hover {
    border-color: rgba(255, 107, 157, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #ff6b9d;
    box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  }
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bead-color);
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

.color-grid.compact .color-item {
  padding: 0.25rem;

  .color-preview {
    width: 20px;
    height: 20px;
  }
}

.color-code {
  font-size: 0.625rem;
  color: #666;
  font-weight: 500;
}

.selected-color-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.color-preview-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.color-meta {
  display: flex;
  gap: 1rem;
}

.color-code-large,
.color-brand {
  font-size: 0.875rem;
  color: #666;
}

.color-rgb,
.color-hex {
  font-size: 0.75rem;
  color: #999;
  font-family: monospace;
}

@media (max-width: 640px) {
  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }

  .selected-color-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .color-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>