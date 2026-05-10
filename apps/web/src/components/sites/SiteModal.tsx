'use client'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { X } from 'lucide-react'

const SITE_TYPES = [
  { value: 'organization', label: 'ארגון (ראשי)' },
  { value: 'site', label: 'אתר' },
  { value: 'building', label: 'בניין' },
  { value: 'floor', label: 'קומה' },
  { value: 'zone', label: 'אזור / מתחם' },
  { value: 'department_site', label: 'מחלקה באתר' },
]

export function SiteModal({
  parentId,
  editSite,
  onClose,
  onSuccess,
}: {
  parentId?: string
  editSite?: any
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = !!editSite
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editSite || { type: 'site', parentId },
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? api.put(`/v1/sites/${editSite.id}`, data)
        : api.post('/v1/sites', { ...data, parentId }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">{isEdit ? 'עריכת אתר' : parentId ? 'הוספת תת-אתר' : 'אתר חדש'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם האתר *</label>
              <input {...register('name', { required: true })} className={inputCls} placeholder="לדוגמה: מפעל הצפון" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קוד *</label>
              <input {...register('code', { required: true })} className={inputCls} placeholder="NORTH-01" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
              <select {...register('type')} className={inputCls}>
                {SITE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
                <input {...register('city')} className={inputCls} placeholder="תל אביב" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input {...register('phone')} className={inputCls} dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
              <input {...register('address')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <textarea {...register('description')} rows={2} className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ביטול</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60">
              {mutation.isPending ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
