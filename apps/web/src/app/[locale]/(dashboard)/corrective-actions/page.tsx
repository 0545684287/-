'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { correctiveActionsApi } from '@/lib/api'
import { AlertTriangle, Plus, XCircle, Clock, CheckCircle, Search, X, ChevronDown } from 'lucide-react'

const SEVERITY_LABELS: Record<string, string> = { low: 'נמוך', medium: 'בינוני', high: 'גבוה', critical: 'קריטי' }
const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'פתוח', in_progress: 'בטיפול', pending_review: 'ממתין לאישור', closed: 'סגור', cancelled: 'בוטל',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700', in_progress: 'bg-blue-100 text-blue-700',
  pending_review: 'bg-yellow-100 text-yellow-700', closed: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-500',
}
const CATEGORY_LABELS: Record<string, string> = {
  safety_hazard: 'סכנת בטיחות', near_miss: 'כמעט תאונה', accident: 'תאונה',
  equipment_failure: 'כשל ציוד', procedure_violation: 'הפרת נוהל', environmental: 'סביבה', other: 'אחר',
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

function AddActionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', category: 'other', dueDate: '' })
  const mutation = useMutation({ mutationFn: () => correctiveActionsApi.create(form), onSuccess })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">פעולה מתקנת חדשה</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">כותרת *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תיאור *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">חומרה</label>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">קטגוריה</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תאריך יעד</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button onClick={() => mutation.mutate()} disabled={!form.title || !form.description || mutation.isPending}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'שומר...' : 'צור פעולה'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CorrectiveActionsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stats } = useQuery({ queryKey: ['ca-stats'], queryFn: () => correctiveActionsApi.getStats().then((r: any) => r.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['corrective-actions', search, statusFilter, severityFilter],
    queryFn: () => correctiveActionsApi.getAll({ search, status: statusFilter, severity: severityFilter }).then((r: any) => r.data),
    placeholderData: (prev: any) => prev,
  })
  const actions = (data as any)?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">פעולות מתקנות</h1>
          <p className="text-sm text-gray-500 mt-0.5">רשומות · {(data as any)?.total ?? 0}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> פעולה חדשה
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={XCircle} label="פתוחות" value={(stats as any)?.open} color="bg-red-500" />
        <StatCard icon={Clock} label="בטיפול" value={(stats as any)?.inProgress} color="bg-blue-500" />
        <StatCard icon={AlertTriangle} label="באיחור" value={(stats as any)?.overdue} color="bg-orange-500" />
        <StatCard icon={CheckCircle} label="סגורות" value={(stats as any)?.closed} color="bg-green-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל רמות החומרה</option>
            {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">טוען...</div>}
        {!isLoading && actions.length === 0 && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין פעולות מתקנות</p>
            <p className="text-gray-400 text-sm mt-1">לחץ "פעולה חדשה" כדי לדווח על אירוע</p>
          </div>
        )}
        {actions.length > 0 && (
          <div className="divide-y divide-gray-100">
            {actions.map((action: any) => (
              <div key={action.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{action.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{CATEGORY_LABELS[action.category] ?? action.category}</span>
                      {action.dueDate && <span className="text-xs text-gray-400">· יעד: {new Date(action.dueDate).toLocaleDateString('he-IL')}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[action.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                      {SEVERITY_LABELS[action.severity] ?? action.severity}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[action.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[action.status] ?? action.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddActionModal onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['corrective-actions'] }); qc.invalidateQueries({ queryKey: ['ca-stats'] }) }} />
      )}
    </div>
  )
}
