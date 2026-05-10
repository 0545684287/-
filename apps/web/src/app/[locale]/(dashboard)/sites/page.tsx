'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SiteTree } from '@/components/sites/SiteTree'
import { SiteModal } from '@/components/sites/SiteModal'
import { MapPin, Users, Building2, Pencil, Trash2 } from 'lucide-react'

const SITE_TYPE_LABELS: Record<string, string> = {
  organization: 'ארגון', site: 'אתר', building: 'בניין',
  floor: 'קומה', zone: 'אזור', department_site: 'מחלקה',
}

export default function SitesPage() {
  const qc = useQueryClient()
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const [modal, setModal] = useState<{ open: boolean; parentId?: string; editSite?: any }>({ open: false })

  const { data: tree = [] } = useQuery({
    queryKey: ['sites-tree'],
    queryFn: () => api.get('/v1/sites/tree').then((r: any) => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['sites-stats'],
    queryFn: () => api.get('/v1/sites/stats').then((r: any) => r.data),
  })

  const handleSuccess = () => {
    setModal({ open: false })
    qc.invalidateQueries({ queryKey: ['sites-tree'] })
    qc.invalidateQueries({ queryKey: ['sites-stats'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול אתרים</h1>
          <p className="text-sm text-gray-500 mt-0.5">היררכיית אתרים, בניינים וקומות של הארגון</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats?.active ?? '—'}</p>
            <p className="text-xs text-gray-500">אתרים פעילים</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats?.byType?.building ?? 0}</p>
            <p className="text-xs text-gray-500">בניינים</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats?.total ?? '—'}</p>
            <p className="text-xs text-gray-500">סה"כ יחידות</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree */}
        <div className="lg:col-span-1">
          <SiteTree
            sites={tree}
            selectedId={selectedSite?.id}
            onSelect={setSelectedSite}
            onAddRoot={() => setModal({ open: true })}
            onAddChild={parentId => setModal({ open: true, parentId })}
          />
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selectedSite ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">בחר אתר מהעץ לצפייה בפרטים</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {SITE_TYPE_LABELS[selectedSite.type] || selectedSite.type}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{selectedSite.code}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedSite.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ open: true, editSite: selectedSite })}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> עריכה
                  </button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4">
                {[
                  { label: 'עיר', value: selectedSite.city },
                  { label: 'כתובת', value: selectedSite.address },
                  { label: 'טלפון', value: selectedSite.phone },
                  { label: 'תיאור', value: selectedSite.description },
                ].map(f => f.value ? (
                  <div key={f.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                    <p className="text-sm text-gray-800">{f.value}</p>
                  </div>
                ) : null)}
              </div>

              {selectedSite.children?.length > 0 && (
                <div className="px-5 pb-5">
                  <p className="text-xs font-medium text-gray-500 mb-2">תת-אתרים ({selectedSite.children.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSite.children.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedSite(c)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:border-primary hover:text-primary transition"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <SiteModal
          parentId={modal.parentId}
          editSite={modal.editSite}
          onClose={() => setModal({ open: false })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
