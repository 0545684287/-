'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api'
import { MoreVertical, Pencil, Trash2, Eye, History } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: 'פעיל', class: 'bg-green-100 text-green-700' },
  inactive: { label: 'לא פעיל', class: 'bg-gray-100 text-gray-600' },
  on_leave: { label: 'בחופשה', class: 'bg-yellow-100 text-yellow-700' },
}

const CONTRACT_LABELS: Record<string, string> = {
  permanent: 'קבוע', temporary: 'זמני', contractor: 'קבלן',
}

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) return <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
      {initials}
    </div>
  )
}

function ActionMenu({ employee, onRefresh }: { employee: any; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => hrApi.deleteEmployee(employee.id),
    onSuccess: () => { onRefresh(); setOpen(false) },
  })

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
              <Eye className="w-4 h-4" /> צפייה בפרופיל
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
              <Pencil className="w-4 h-4" /> עריכה
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
              <History className="w-4 h-4" /> היסטוריה
            </button>
            <hr className="my-1" />
            <button
              onClick={() => deleteMutation.mutate()}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" /> השבתה
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function EmployeeTable({ employees, loading, onRefresh }: {
  employees: any[]
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs">
            <th className="px-4 py-3 text-start font-medium">עובד</th>
            <th className="px-4 py-3 text-start font-medium">מספר</th>
            <th className="px-4 py-3 text-start font-medium">מחלקה</th>
            <th className="px-4 py-3 text-start font-medium">סוג העסקה</th>
            <th className="px-4 py-3 text-start font-medium">תאריך כניסה</th>
            <th className="px-4 py-3 text-start font-medium">סטטוס</th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">טוען עובדים...</td></tr>
          )}
          {!loading && employees.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
              <p className="font-medium">אין עובדים</p>
              <p className="text-xs mt-1">הוסף עובד ראשון או ייבא מ-Excel</p>
            </td></tr>
          )}
          {employees.map(emp => {
            const st = STATUS_CONFIG[emp.status] || STATUS_CONFIG.inactive
            return (
              <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${emp.firstName} ${emp.lastName}`} avatar={emp.avatar} />
                    <div>
                      <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-gray-500 text-xs">{emp.employeeNumber}</td>
                <td className="px-4 py-3 text-gray-600">{emp.departmentId || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{CONTRACT_LABELS[emp.contractType] || emp.contractType}</td>
                <td className="px-4 py-3 text-gray-500">
                  {emp.startDate ? new Date(emp.startDate).toLocaleDateString('he-IL') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.class}`}>{st.label}</span>
                </td>
                <td className="px-4 py-3">
                  <ActionMenu employee={emp} onRefresh={onRefresh} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
