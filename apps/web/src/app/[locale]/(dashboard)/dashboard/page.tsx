'use client'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { Users, AlertTriangle, Wrench, GraduationCap, FileText, TrendingUp } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '-'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then((r: any) => r.data),
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity().then((r: any) => r.data),
  })

  const score = stats?.safetyScore ?? 0
  const scoreData = [{ value: score, fill: score > 75 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' }]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>

      {/* Safety Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center lg:col-span-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{t('safetyScore')}</p>
          <div className="h-32 w-full">
            <ResponsiveContainer>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={scoreData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={10} background />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-3xl font-bold text-gray-900">{score}</p>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={Users} label="עובדים פעילים" value={stats?.employees} color="bg-blue-500" />
          <StatCard icon={GraduationCap} label="הדרכות השנה" value={stats?.trainings} color="bg-purple-500" />
          <StatCard icon={Wrench} label="ציוד לבדיקה" value={stats?.equipment} color="bg-orange-500" />
          <StatCard icon={AlertTriangle} label="אירועים פתוחים" value={stats?.incidents} color="bg-red-500" />
          <StatCard icon={FileText} label="טפסים ממתינים" value={stats?.forms} color="bg-teal-500" />
          <StatCard icon={TrendingUp} label="פעולות מתקנות" value={stats?.correctiveActions} color="bg-indigo-500" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('recentActivity')}</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {!activity?.length && (
            <p className="p-5 text-sm text-gray-400 text-center">אין פעילות אחרונה</p>
          )}
          {activity?.map((item: any) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-800">{item.action}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-500">{item.module}</span>
              </div>
              <span className="text-gray-400 text-xs">
                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('he-IL') : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
