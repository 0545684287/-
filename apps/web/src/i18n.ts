import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['he', 'en', 'ar'] as const
export const defaultLocale = 'he' as const
export type Locale = (typeof locales)[number]
export const rtlLocales: Locale[] = ['he', 'ar']

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as Locale) ? locale : defaultLocale
  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  }
})
