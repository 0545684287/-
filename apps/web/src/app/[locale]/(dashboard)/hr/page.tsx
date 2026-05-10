'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useLocale } from 'next/navigation'
import { hrApi } from '@/lib/api'
import { UserPlus, Search, Download, Upload, Users, UserCheck, Clock, UserX } from 'lucide-react'
import { EmployeeTable } from '@/components/hr/EmployeeTable'
import { AddEmployeeModal } from '@/components/hr/AddEmployeeModal'
import { ImportModal } from '@/components/hr/ImportModal'

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function HrPage() {
  const t = useTranslations('hr')
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [contractFilter, setContractFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [page, setPage] = useState(1)

  const { data: stats } = useQuery({
    queryKey: ['hr-stats'],
    queryFn: () => hrApi.getStats().then((r: any) => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, statusFilter, contractFilter, page],
    queryFn: () => hrApi.getEmployees({ search, status: statusFilter, contractType: contractFilter, page, limit: 20 }).then((r: any) => r.data),
    placeholderData: prev => prev,
  })

  const handleExport = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/hr/employees/export`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'x-tenant-slug': localStorage.getItem('tenantSlug') || '',
      },
    })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees.xlsx'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('employees')} · {data?.total ?? 0}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download className="w-4 h-4" /> ייצוא
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Upload className="w-4 h-4" /> ייבוא Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" /> {t('addEmployee')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('stats.total')} value={stats?.total} color="bg-blue-500" />
        <StatCard icon={UserCheck} label={t('stats.active')} value={stats?.active} color="bg-green-500" />
        <StatCard icon={Clock} label={t('stats.onLeave')} value={stats?.onLeave} color="bg-yellow-500" />
        <StatCard icon={UserX} label={t('stats.inactive')} value={stats?.inactive} color="bg-gray-400" />
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="חיפוש לפי שם, מספר, אימייל..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          >
            <option value="">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="on_leave">בחופשה</option>
            <option value="inactive">לא פעיל</option>
          </select>
          <select
            value={contractFilter}
            onChange={e => { setContractFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          >
            <option value="">כל סוגי ההעסקה</option>
            <option value="permanent">קבוע</option>
            <option value="temporary">זמני</option>
            <option value="contractor">קבלן</option>
          </select>
        </div>

        <EmployeeTable
          employees={data?.data ?? []}
          loading={isLoading}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['employees'] })}
        />

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">עמוד {page} מתוך {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50">הקודם</button>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50">הבא</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); qc.invalidateQueries({ queryKey: ['employees'] }); qc.invalidateQueries({ queryKey: ['hr-stats'] }) }} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onSuccess={() => { setShowImportModal(false); qc.invalidateQueries({ queryKey: ['employees'] }) }} />}
    </div>
  )
}
