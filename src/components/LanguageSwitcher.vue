<template>
  <div class="language-switcher">
    <button
      v-for="locale in locales"
      :key="locale.code"
      :class="['locale-btn', { active: currentLocale === locale.code }]"
      @click="changeLocale(locale.code)"
      :title="locale.name"
    >
      <span class="locale-flag">{{ locale.flag }}</span>
      <span class="locale-name">{{ locale.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAvailableLocales, setLocale, type Locale } from '@/locales'

const { locale } = useI18n()

const locales = getAvailableLocales()
const currentLocale = computed(() => locale.value)

const changeLocale = (newLocale: Locale) => {
  setLocale(newLocale)
}
</script>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  gap: 0.5rem;
}

.locale-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: #ff6b9d;
    background: rgba(255, 107, 157, 0.05);
  }

  &.active {
    border-color: #ff6b9d;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
    color: white;

    .locale-name {
      font-weight: 600;
    }
  }
}

.locale-flag {
  font-size: 1rem;
  line-height: 1;
}

.locale-name {
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .locale-name {
    display: none;
  }

  .locale-btn {
    padding: 0.35rem;
  }
}
</style>
