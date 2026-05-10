'use client'
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
    </div>
  )
}
