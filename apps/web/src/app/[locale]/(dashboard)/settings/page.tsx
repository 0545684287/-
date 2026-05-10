'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Palette, Bell, Package, Globe } from 'lucide-react'

const MODULES = [
  { key: 'hr', label: 'משאבי אנוש' },
  { key: 'training', label: 'הדרכות' },
  { key: 'equipment', label: 'ניהול ציוד' },
  { key: 'corrective_actions', label: 'פעולות מתקנות' },
  { key: 'contractors', label: 'קבלנים ואורחים' },
  { key: 'forms', label: 'טפסים וביקורות' },
  { key: 'dashboard', label: 'דשבורד בטיחות' },
]

export default function SettingsPage() {
  const t = useTranslations('settings')
  const qc = useQueryClient()
  const updateTenant = useAuthStore(s => s.updateTenant)
  const [tab, setTab] = useState<'branding' | 'modules' | 'notifications'>('branding')

  const { data: branding } = useQuery({
    queryKey: ['settings-branding'],
    queryFn: () => settingsApi.getBranding().then((r: any) => r.data),
  })

  const { data: modulesData } = useQuery({
    queryKey: ['settings-modules'],
    queryFn: () => settingsApi.getModules().then((r: any) => r.data),
  })

  const [brandingForm, setBrandingForm] = useState<any>({})
  const [enabledModules, setEnabledModules] = useState<string[]>([])

  const brandingMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateBranding(data),
    onSuccess: (res: any) => {
      updateTenant({ branding: res.data })
      qc.invalidateQueries({ queryKey: ['settings-branding'] })
    },
  })

  const modulesMutation = useMutation({
    mutationFn: (modules: string[]) => settingsApi.updateModules(modules),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings-modules'] }),
  })

  const tabs = [
    { key: 'branding', label: t('branding'), icon: Palette },
    { key: 'modules', label: t('modules'), icon: Package },
    { key: 'notifications', label: t('notifications'), icon: Bell },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'branding' && (
            <div className="space-y-5 max-w-lg">
              {[
                { key: 'companyName', label: t('companyName'), type: 'text' },
                { key: 'primaryColor', label: t('primaryColor'), type: 'color' },
                { key: 'secondaryColor', label: t('secondaryColor'), type: 'color' },
                { key: 'customDomain', label: t('customDomain'), type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    defaultValue={branding?.[field.key] || ''}
                    onChange={e => setBrandingForm((p: any) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              ))}
              <button
                onClick={() => brandingMutation.mutate({ ...branding, ...brandingForm })}
                disabled={brandingMutation.isPending}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
              >
                {brandingMutation.isPending ? '...' : 'שמור שינויים'}
              </button>
            </div>
          )}

          {tab === 'modules' && (
            <div className="space-y-3 max-w-md">
              <p className="text-sm text-gray-500 mb-4">בחר אילו מודולים יהיו פעילים עבור לקוח זה</p>
              {MODULES.map(m => {
                const active = (modulesData?.modules || []).includes(m.key)
                return (
                  <label key={m.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-800">{m.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={active}
                      onChange={e => {
                        const current = modulesData?.modules || []
                        const updated = e.target.checked ? [...current, m.key] : current.filter((k: string) => k !== m.key)
                        modulesMutation.mutate(updated)
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                  </label>
                )
              })}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-gray-500 mb-4">הגדר אילו ערוצי התראה יהיו פעילים</p>
              {[
                { key: 'email', label: 'אימייל' },
                { key: 'sms', label: 'SMS' },
                { key: 'push', label: 'Push Notifications' },
                { key: 'whatsapp', label: 'WhatsApp' },
              ].map(ch => (
                <label key={ch.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">{ch.label}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
