'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formsApi } from '@/lib/api'
import { FileText, Plus, CheckSquare, Eye, Send, Search, X } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  safety_inspection: 'ביקורת בטיחות', incident_report: 'דיווח אירוע', risk_assessment: 'הערכת סיכונים',
  permit_to_work: 'היתר עבודה', toolbox_talk: 'שיחת בטיחות', checklist: 'רשימת תיוג', other: 'אחר',
}
const CATEGORY_COLORS: Record<string, string> = {
  safety_inspection: 'bg-blue-100 text-blue-700', incident_report: 'bg-red-100 text-red-700',
  risk_assessment: 'bg-orange-100 text-orange-700', permit_to_work: 'bg-purple-100 text-purple-700',
  toolbox_talk: 'bg-green-100 text-green-700', checklist: 'bg-gray-100 text-gray-600', other: 'bg-gray-100 text-gray-600',
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

function AddTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: '', category: 'checklist', description: '', fields: [] as any[] })
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false })
  const mutation = useMutation({ mutationFn: () => formsApi.createTemplate(form), onSuccess })

  const addField = () => {
    if (!newField.label) return
    setForm(p => ({ ...p, fields: [...p.fields, { ...newField, id: Date.now().toString() }] }))
    setNewField({ label: '', type: 'text', required: false })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">טופס חדש</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">שם הטופס *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">קטגוריה</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תיאור</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>

          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">שדות הטופס</p>
            {form.fields.map((f: any, i) => (
              <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
                <span>{f.label} ({f.type})</span>
                <button onClick={() => setForm(p => ({ ...p, fields: p.fields.filter((_, j) => j !== i) }))}
                  className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newField.label} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
                placeholder="שם השדה" className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
              <select value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}
                className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none bg-white">
                <option value="text">טקסט</option>
                <option value="number">מספר</option>
                <option value="boolean">כן/לא</option>
                <option value="date">תאריך</option>
                <option value="select">בחירה</option>
              </select>
              <button onClick={addField} className="px-2 py-1 bg-primary text-white rounded text-xs">+</button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button onClick={() => mutation.mutate()} disabled={!form.title || mutation.isPending}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'שומר...' : 'צור טופס'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FormsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stats } = useQuery({ queryKey: ['forms-stats'], queryFn: () => formsApi.getStats().then((r: any) => r.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['form-templates', search, categoryFilter],
    queryFn: () => formsApi.getTemplates({ search, category: categoryFilter }).then((r: any) => r.data),
    placeholderData: (prev: any) => prev,
  })
  const templates = (data as any)?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">טפסים וביקורות</h1>
          <p className="text-sm text-gray-500 mt-0.5">תבניות · {(data as any)?.total ?? 0}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> טופס חדש
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="תבניות פעילות" value={(stats as any)?.totalTemplates} color="bg-blue-500" />
        <StatCard icon={Send} label="הגשות סה״כ" value={(stats as any)?.totalSubmissions} color="bg-purple-500" />
        <StatCard icon={Eye} label="ממתינות לבדיקה" value={(stats as any)?.pendingReview} color="bg-yellow-500" />
        <StatCard icon={CheckSquare} label="אושרו" value={(stats as any)?.approved} color="bg-green-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש טפסים..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל הקטגוריות</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">טוען...</div>}
        {!isLoading && templates.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין טפסים עדיין</p>
            <p className="text-gray-400 text-sm mt-1">לחץ "טופס חדש" כדי ליצור תבנית</p>
          </div>
        )}
        {templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {templates.map((t: any) => (
              <div key={t.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_LABELS[t.category] ?? t.category}
                  </span>
                </div>
                <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                {t.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>}
                <p className="text-xs text-gray-400 mt-2">{t.fields?.length ?? 0} שדות · גרסה {t.version}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddTemplateModal onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['form-templates'] }); qc.invalidateQueries({ queryKey: ['forms-stats'] }) }} />
      )}
    </div>
  )
}
