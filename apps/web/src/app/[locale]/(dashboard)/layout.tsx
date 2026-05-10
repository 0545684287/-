import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="main-content min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
