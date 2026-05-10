'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface LoginForm {
  tenantSlug: string
  email: string
  password: string
  twoFactorCode?: string
}

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const locale = useLocale()
  const login = useAuthStore(s => s.login)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    try {
      const res: any = await api.post('/v1/auth/login', data)
      if (res.data?.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        return
      }
      login({
        user: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        tenantSlug: data.tenantSlug,
      })
      router.push(`/${locale}/dashboard`)
    } catch {
      setError(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SafetyWork</h1>
          <p className="text-gray-500 mt-1">{t('login')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenantSlug')}</label>
            <input
              {...register('tenantSlug', { required: true })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              placeholder="my-company"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              {...register('email', { required: true })}
              type="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input
              {...register('password', { required: true })}
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              dir="ltr"
            />
          </div>

          {requiresTwoFactor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('twoFactor')}</label>
              <input
                {...register('twoFactorCode')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition tracking-widest text-center"
                maxLength={6}
                placeholder="000000"
                dir="ltr"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading ? '...' : t('loginButton')}
          </button>
        </form>
      </div>
    </div>
  )
}
