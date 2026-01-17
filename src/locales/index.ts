import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export type Locale = 'zh-CN' | 'en-US'

const defaultLocale = (localStorage.getItem('perler_beads_locale') || 'zh-CN') as Locale

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  // Make number and datetime formatting locale-aware
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    }
  }
})

// Save locale preference
export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('perler_beads_locale', locale)
}

// Get current locale
export function getLocale(): Locale {
  return i18n.global.locale.value as Locale
}

// Get available locales
export function getAvailableLocales() {
  return [
    { code: 'zh-CN' as Locale, name: '简体中文', flag: '🇨🇳' },
    { code: 'en-US' as Locale, name: 'English', flag: '🇺🇸' }
  ]
}

export default i18n
