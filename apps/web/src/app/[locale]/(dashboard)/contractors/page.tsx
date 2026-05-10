'use client'
<<<<<<< HEAD
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractorsApi } from '@/lib/api'
import { HardHat, Plus, CheckCircle, Clock, AlertTriangle, XCircle, Search, X, Star } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל', pending_approval: 'ממתין לאישור', suspended: 'מושהה', expired: 'פג תוקף',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700', pending_approval: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-500',
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
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

function AddContractorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '', licenseNumber: '', licenseExpiryDate: '' })
  const mutation = useMutation({ mutationFn: () => contractorsApi.create(form), onSuccess })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">קבלן חדש</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">שם החברה *</label>
            <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">איש קשר *</label>
              <input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">טלפון</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">אימייל *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">מס׳ רישיון</label>
              <input value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">תפוגת רישיון</label>
              <input type="date" value={form.licenseExpiryDate} onChange={e => setForm(p => ({ ...p, licenseExpiryDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button onClick={() => mutation.mutate()} disabled={!form.companyName || !form.contactPerson || !form.email || mutation.isPending}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'שומר...' : 'הוסף קבלן'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContractorsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stats } = useQuery({ queryKey: ['contractor-stats'], queryFn: () => contractorsApi.getStats().then((r: any) => r.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['contractors', search, statusFilter],
    queryFn: () => contractorsApi.getAll({ search, status: statusFilter }).then((r: any) => r.data),
    placeholderData: (prev: any) => prev,
  })
  const contractors = (data as any)?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">קבלנים ואורחים</h1>
          <p className="text-sm text-gray-500 mt-0.5">קבלנים · {(data as any)?.total ?? 0}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> הוסף קבלן
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HardHat} label="סה״כ קבלנים" value={(stats as any)?.total} color="bg-gray-500" />
        <StatCard icon={CheckCircle} label="פעילים" value={(stats as any)?.active} color="bg-green-500" />
        <StatCard icon={Clock} label="ממתינים לאישור" value={(stats as any)?.pendingApproval} color="bg-yellow-500" />
        <StatCard icon={AlertTriangle} label="רישיון פג בקרוב" value={(stats as any)?.expiringLicenses} color="bg-red-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם חברה או איש קשר..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">טוען...</div>}
        {!isLoading && contractors.length === 0 && (
          <div className="p-12 text-center">
            <HardHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין קבלנים רשומים</p>
            <p className="text-gray-400 text-sm mt-1">לחץ "הוסף קבלן" כדי להתחיל</p>
          </div>
        )}
        {contractors.length > 0 && (
          <div className="divide-y divide-gray-100">
            {contractors.map((c: any) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                    {c.companyName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.companyName}</p>
                    <p className="text-xs text-gray-500">{c.contactPerson} · {c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (c.safetyRating ?? 3) ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddContractorModal onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['contractors'] }); qc.invalidateQueries({ queryKey: ['contractor-stats'] }) }} />
      )}
=======
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus } from 'lucide-react'

export default function ModulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['MODULE_KEY'],
    queryFn: () => api.get('/v1/MODULE_PATH').then((r: any) => r.data?.data ?? []),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">MODULE_TITLE</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium">
          <Plus className="w-4 h-4" />
          הוסף
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading && <p className="text-center text-gray-400">טוען...</p>}
        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">אין נתונים עדיין</p>
            <p className="text-sm mt-1">לחץ "הוסף" כדי להתחיל</p>
          </div>
        )}
      </div>
>>>>>>> origin/main
    </div>
  )
}
