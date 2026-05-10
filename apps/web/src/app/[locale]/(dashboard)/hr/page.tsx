'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api'
import { Users, UserPlus, Search, MoreVertical } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    on_leave: 'bg-yellow-100 text-yellow-700',
  }
  const labels: Record<string, string> = { active: 'פעיל', inactive: 'לא פעיל', on_leave: 'בחופשה' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>
      {labels[status] || status}
    </span>
  )
}

export default function HrPage() {
  const t = useTranslations('hr')
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['hr-stats'],
    queryFn: () => hrApi.getStats().then((r: any) => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => hrApi.getEmployees({ search }).then((r: any) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrApi.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })

  const employees = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          {t('addEmployee')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('stats.total'), value: stats?.total, color: 'text-blue-600' },
          { label: t('stats.active'), value: stats?.active, color: 'text-green-600' },
          { label: t('stats.onLeave'), value: stats?.onLeave, color: 'text-yellow-600' },
          { label: t('stats.inactive'), value: stats?.inactive, color: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('firstName') + ' / ' + t('employeeNumber')}
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-start">{t('employeeNumber')}</th>
                <th className="px-4 py-3 text-start">{t('firstName')} {t('lastName')}</th>
                <th className="px-4 py-3 text-start">{t('department')}</th>
                <th className="px-4 py-3 text-start">{t('contractType')}</th>
                <th className="px-4 py-3 text-start">סטטוס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">טוען...</td></tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">אין עובדים</td></tr>
              )}
              {employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-gray-500">{emp.employeeNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                    <p className="text-xs text-gray-400 font-normal">{emp.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.departmentId}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.contractType}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(emp.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
