import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sq from './locales/sq.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    sq
  }
})

export default i18n
