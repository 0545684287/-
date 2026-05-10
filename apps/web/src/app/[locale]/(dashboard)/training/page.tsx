'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingApi } from '@/lib/api'
import { GraduationCap, Plus, BookOpen, CheckCircle, AlertCircle, Search, X } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  safety: 'בטיחות', procedure: 'נהלים', equipment: 'ציוד', regulatory: 'רגולציה', emergency: 'חירום',
}
const TYPE_COLORS: Record<string, string> = {
  safety: 'bg-red-100 text-red-700', procedure: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700', regulatory: 'bg-orange-100 text-orange-700', emergency: 'bg-yellow-100 text-yellow-700',
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

function AddCourseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: '', type: 'safety', durationMinutes: 60, certificationValidityDays: 365, isMandatory: true, description: '' })
  const mutation = useMutation({ mutationFn: () => trainingApi.createCourse(form), onSuccess })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">קורס חדש</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">שם הקורס *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">סוג</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">משך (דקות)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: +e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תקופת תוקף (ימים)</label>
            <input type="number" value={form.certificationValidityDays} onChange={e => setForm(p => ({ ...p, certificationValidityDays: +e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">תיאור</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isMandatory} onChange={e => setForm(p => ({ ...p, isMandatory: e.target.checked }))} />
            חובה לכל העובדים
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button onClick={() => mutation.mutate()} disabled={!form.title || mutation.isPending}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'שומר...' : 'צור קורס'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stats } = useQuery({ queryKey: ['training-stats'], queryFn: () => trainingApi.getStats().then((r: any) => r.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['training-courses', search, typeFilter],
    queryFn: () => trainingApi.getCourses({ search, type: typeFilter }).then((r: any) => r.data),
    placeholderData: (prev: any) => prev,
  })
  const courses = (data as any)?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הדרכות</h1>
          <p className="text-sm text-gray-500 mt-0.5">קורסים · {(data as any)?.total ?? 0}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> קורס חדש
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="סה״כ קורסים" value={(stats as any)?.totalCourses} color="bg-blue-500" />
        <StatCard icon={GraduationCap} label="סה״כ הרשמות" value={(stats as any)?.totalEnrollments} color="bg-purple-500" />
        <StatCard icon={CheckCircle} label="הושלמו" value={(stats as any)?.completed} color="bg-green-500" />
        <StatCard icon={AlertCircle} label="פגי תוקף" value={(stats as any)?.expired} color="bg-red-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם קורס..."
              className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
            <option value="">כל הסוגים</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">טוען...</div>}
        {!isLoading && courses.length === 0 && (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין קורסים עדיין</p>
            <p className="text-gray-400 text-sm mt-1">לחץ "קורס חדש" כדי להתחיל</p>
          </div>
        )}
        {courses.length > 0 && (
          <div className="divide-y divide-gray-100">
            {courses.map((course: any) => (
              <div key={course.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.durationMinutes} דק׳ · תוקף {course.certificationValidityDays} ימים</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {course.isMandatory && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">חובה</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[course.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_LABELS[course.type] ?? course.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddCourseModal onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['training-courses'] }); qc.invalidateQueries({ queryKey: ['training-stats'] }) }} />
      )}
    </div>
  )
}
