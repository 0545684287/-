'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentApi } from '@/lib/api'
import { Wrench, Plus, CheckCircle, AlertTriangle, XCircle, Clock, Search, X } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  operational: 'פעיל', maintenance: 'בתחזוקה', faulty: 'תקול', decommissioned: 'הוצא משירות',
}
const STATUS_COLORS: Record<string, string> = {
  operational: 'bg-green-100 text-green-700', maintenance: 'bg-yellow-100 text-yellow-700',
  faulty: 'bg-red-100 text-red-700', decommissioned: 'bg-gray-100 text-gray-500',
}
const TYPE_LABELS: Record<string, string> = {
  safety_gear: 'ציוד מגן', fire_protection: 'כיבוי אש', first_aid: 'עזרה ראשונה',
  machinery: 'מכונות', vehicle: 'כלי רכב', electrical: 'חשמל', other: 'אחר',
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

function AddEquipmentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'other', serialNumber: '', location: '', manufacturer: '', model: '', nextInspectionDate: '' })
  const mutation = useMutation({ mutationFn: () => equipmentApi.create(form), onSuccess })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">ציוד חדש</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">שם הציוד *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">קטגוריה</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">מספר סידורי</label>
              <input value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">מיקום</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">יצרן</label>
              <input value={form.manufacturer} onChange={e => setForm(p => ({ ...p, manufacturer: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">דגם</label>
              <input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תאריך בדיקה הבאה</label>
            <input type="date" value={form.nextInspectionDate} onChange={e => setForm(p => ({ ...p, nextInspectionDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'שומר...' : 'הוסף ציוד'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EquipmentPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stats } = useQuery({ queryKey: ['equipment-stats'], queryFn: () => equipmentApi.getStats().then((r: any) => r.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['equipment', search, statusFilter],
    queryFn: () => equipmentApi.getAll({ search, status: statusFilter }).then((r: any) => r.data),
    placeholderData: (prev: any) => prev,
  })
  const items = (data as any)?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול ציוד</h1>
          <p className="text-sm text-gray-500 mt-0.5">פריטים · {(data as any)?.total ?? 0}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> הוסף ציוד
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wrench} label="סה״כ פריטים" value={(stats as any)?.total} color="bg-gray-500" />
        <StatCard icon={CheckCircle} label="פעיל" value={(stats as any)?.operational} color="bg-green-500" />
        <StatCard icon={Clock} label="בתחזוקה" value={(stats as any)?.maintenance} color="bg-yellow-500" />
        <StatCard icon={AlertTriangle} label="בדיקה באיחור" value={(stats as any)?.overdueInspection} color="bg-red-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם או מספר סידורי..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">טוען...</div>}
        {!isLoading && items.length === 0 && (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין ציוד רשום</p>
            <p className="text-gray-400 text-sm mt-1">לחץ "הוסף ציוד" כדי להתחיל</p>
          </div>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-right">
                  <th className="px-4 py-3 font-medium text-gray-500">שם</th>
                  <th className="px-4 py-3 font-medium text-gray-500">קטגוריה</th>
                  <th className="px-4 py-3 font-medium text-gray-500">מיקום</th>
                  <th className="px-4 py-3 font-medium text-gray-500">בדיקה הבאה</th>
                  <th className="px-4 py-3 font-medium text-gray-500">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                      {item.serialNumber && <span className="text-xs text-gray-400 block">{item.serialNumber}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[item.type] ?? item.type}</td>
                    <td className="px-4 py-3 text-gray-600">{item.location ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.nextInspectionDate ? new Date(item.nextInspectionDate).toLocaleDateString('he-IL') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddEquipmentModal onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['equipment'] }); qc.invalidateQueries({ queryKey: ['equipment-stats'] }) }} />
      )}
    </div>
  )
}
