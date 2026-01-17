<template>
  <div class="size-selector">
    <div class="size-section">
      <label class="size-label">{{ t('sizeSelector.beadSize') }}</label>
      <div class="size-options">
        <button
          v-for="size in beadSizes"
          :key="size.value"
          :class="['size-btn', { active: modelValue.beadSize === size.value }]"
          @click="selectSize(size.value)"
        >
          <span class="size-icon" :style="{ width: size.iconSize + 'px', height: size.iconSize + 'px' }"></span>
          <span class="size-name">{{ t('beadSizes.' + size.value) }}</span>
          <span class="size-info">{{ size.diameter }}mm</span>
        </button>
      </div>
    </div>

    <div class="size-section">
      <label class="size-label">{{ t('sizeSelector.gridSize') }}</label>
      <div class="grid-inputs">
        <div class="input-group">
          <label for="gridWidth">{{ t('sizeSelector.gridWidth') }}</label>
          <input
            id="gridWidth"
            type="number"
            :value="modelValue.width"
            @input="updateWidth"
            min="10"
            max="200"
            class="size-input"
          >
        </div>
        <div class="input-group">
          <label for="gridHeight">{{ t('sizeSelector.gridHeight') }}</label>
          <input
            id="gridHeight"
            type="number"
            :value="modelValue.height"
            @input="updateHeight"
            min="10"
            max="200"
            class="size-input"
          >
        </div>
      </div>
      <div class="preset-buttons">
        <button
          v-for="preset in presets"
          :key="preset.label"
          :class="['preset-btn', { active: modelValue.width === preset.width && modelValue.height === preset.height }]"
          @click="selectPreset(preset)"
        >
          {{ t('sizeSelector.presets.' + preset.label) }}
        </button>
      </div>
    </div>

    <div class="size-section">
      <label class="size-label">{{ t('sizeSelector.estimatedSize') }}</label>
      <div class="estimated-size">
        <div class="size-info-item">
          <span class="size-info-label">{{ t('sizeSelector.width') }}:</span>
          <span class="size-info-value">{{ estimatedWidth }}mm</span>
        </div>
        <div class="size-info-item">
          <span class="size-info-label">{{ t('sizeSelector.height') }}:</span>
          <span class="size-info-value">{{ estimatedHeight }}mm</span>
        </div>
        <div class="size-info-item">
          <span class="size-info-label">{{ t('sizeSelector.totalBeads') }}:</span>
          <span class="size-info-value">{{ totalBeads }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BeadSize, ImageProcessOptions } from '@/types'
import { BEAD_SIZE_SPECS } from '@/types'

interface Props {
  modelValue: ImageProcessOptions
}

interface Emits {
  (e: 'update:modelValue', value: ImageProcessOptions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const beadSizes = [
  { value: 'mini' as BeadSize, label: 'small', diameter: BEAD_SIZE_SPECS.mini, iconSize: 8 },
  { value: 'regular' as BeadSize, label: 'medium', diameter: BEAD_SIZE_SPECS.regular, iconSize: 16 },
  { value: 'maxi' as BeadSize, label: 'large', diameter: BEAD_SIZE_SPECS.maxi, iconSize: 24 },
  { value: 'mega' as BeadSize, label: 'xl', diameter: BEAD_SIZE_SPECS.mega, iconSize: 32 }
]

const presets = [
  { label: 'small', width: 30, height: 30 },
  { label: 'medium', width: 50, height: 50 },
  { label: 'large', width: 75, height: 75 },
  { label: 'xl', width: 100, height: 100 }
]

const estimatedWidth = computed(() => {
  return (props.modelValue.width * BEAD_SIZE_SPECS[props.modelValue.beadSize]).toFixed(1)
})

const estimatedHeight = computed(() => {
  return (props.modelValue.height * BEAD_SIZE_SPECS[props.modelValue.beadSize]).toFixed(1)
})

const totalBeads = computed(() => {
  return props.modelValue.width * props.modelValue.height
})

const selectSize = (size: BeadSize) => {
  emit('update:modelValue', {
    ...props.modelValue,
    beadSize: size
  })
}

const updateWidth = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Math.max(10, Math.min(200, parseInt(target.value) || 10))
  emit('update:modelValue', {
    ...props.modelValue,
    width: value
  })
}

const updateHeight = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Math.max(10, Math.min(200, parseInt(target.value) || 10))
  emit('update:modelValue', {
    ...props.modelValue,
    height: value
  })
}

const selectPreset = (preset: { label: string; width: number; height: number }) => {
  emit('update:modelValue', {
    ...props.modelValue,
    width: preset.width,
    height: preset.height
  })
}
</script>

<style scoped lang="scss">
.size-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.size-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.size-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.size-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.4rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;

  &:hover {
    border-color: #ff6b9d;
    transform: translateY(-1px);
  }

  &.active {
    border-color: #ff6b9d;
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(255, 138, 128, 0.1) 100%);
  }
}

.size-icon {
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
}

.size-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.size-info {
  font-size: 0.65rem;
  color: #999;
  white-space: nowrap;
}

.grid-inputs {
  display: flex;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  label {
    font-size: 0.75rem;
    color: #666;
  }
}

.size-input {
  padding: 0.625rem 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff6b9d;
  }
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
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

.estimated-size {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 138, 128, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.size-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size-info-label {
  font-size: 0.875rem;
  color: #666;
}

.size-info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ff6b9d;
}

@media (max-width: 640px) {
  .size-options {
    justify-content: space-between;
    gap: 0.35rem;
  }

  .size-btn {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.3rem;
    gap: 0.25rem;
  }

  .size-name {
    font-size: 0.7rem;
  }

  .size-info {
    font-size: 0.6rem;
  }

  .grid-inputs {
    flex-direction: column;
  }
}
</style>
