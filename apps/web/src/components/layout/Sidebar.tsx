'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth.store'
import {
  Users, GraduationCap, Wrench, CheckSquare, UserCheck,
  FileText, LayoutDashboard, Settings, LogOut, Shield
} from 'lucide-react'
import { clsx } from 'clsx'

const modules = [
  { key: 'dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { key: 'hr', icon: Users, path: 'hr' },
  { key: 'training', icon: GraduationCap, path: 'training' },
  { key: 'equipment', icon: Wrench, path: 'equipment' },
  { key: 'correctiveActions', icon: CheckSquare, path: 'corrective-actions' },
  { key: 'contractors', icon: UserCheck, path: 'contractors' },
  { key: 'forms', icon: FileText, path: 'forms' },
  { key: 'settings', icon: Settings, path: 'settings' },
]

export function Sidebar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const { user, tenant, logout } = useAuthStore()

  return (
    <aside className="sidebar fixed top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40">
      {/* Brand */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {tenant?.branding?.logo ? (
            <img src={tenant.branding.logo} alt="logo" className="w-9 h-9 rounded-lg object-contain" />
          ) : (
            <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{tenant?.branding?.companyName || 'SafetyWork'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {modules.map(({ key, icon: Icon, path }) => {
          const href = `/${locale}/${path}`
          const isActive = pathname.startsWith(`/${locale}/${path}`)
          return (
            <Link
              key={key}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(key)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  )
}
