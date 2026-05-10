'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown, Building2, MapPin, Layers, Grid2X2, Plus } from 'lucide-react'
import { clsx } from 'clsx'

const SITE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  organization: { label: 'ארגון', icon: Building2, color: 'text-blue-600' },
  site: { label: 'אתר', icon: MapPin, color: 'text-green-600' },
  building: { label: 'בניין', icon: Building2, color: 'text-purple-600' },
  floor: { label: 'קומה', icon: Layers, color: 'text-orange-600' },
  zone: { label: 'אזור', icon: Grid2X2, color: 'text-teal-600' },
  department_site: { label: 'מחלקה', icon: Grid2X2, color: 'text-gray-600' },
}

function SiteNode({
  site,
  depth = 0,
  selectedId,
  onSelect,
  onAddChild,
}: {
  site: any
  depth?: number
  selectedId?: string
  onSelect: (site: any) => void
  onAddChild: (parentId: string) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = site.children?.length > 0
  const cfg = SITE_TYPE_CONFIG[site.type] || SITE_TYPE_CONFIG.site
  const Icon = cfg.icon
  const isSelected = selectedId === site.id

  return (
    <div>
      <div
        className={clsx(
          'group flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition',
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-700',
        )}
        style={{ paddingInlineStart: `${12 + depth * 20}px` }}
        onClick={() => onSelect(site)}
      >
        {/* Expand toggle */}
        <button
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
          className="w-4 h-4 flex-shrink-0 text-gray-400"
        >
          {hasChildren ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
        </button>

        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : cfg.color}`} />

        <span className="text-sm font-medium flex-1 truncate">{site.name}</span>
        <span className="text-xs text-gray-400 hidden group-hover:inline">{cfg.label}</span>

        <button
          onClick={e => { e.stopPropagation(); onAddChild(site.id) }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-primary/10 text-primary transition"
          title="הוסף תת-אתר"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && hasChildren && (
        <div>
          {site.children.map((child: any) => (
            <SiteNode
              key={child.id}
              site={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SiteTree({
  sites,
  selectedId,
  onSelect,
  onAddRoot,
  onAddChild,
}: {
  sites: any[]
  selectedId?: string
  onSelect: (site: any) => void
  onAddRoot: () => void
  onAddChild: (parentId: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">היררכיית אתרים</h3>
        <button
          onClick={onAddRoot}
          className="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> אתר חדש
        </button>
      </div>
      <div className="p-2 max-h-[600px] overflow-y-auto">
        {sites.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">אין אתרים. לחץ "אתר חדש" להתחיל.</p>
        )}
        {sites.map(site => (
          <SiteNode
            key={site.id}
            site={site}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    </div>
  )
}
