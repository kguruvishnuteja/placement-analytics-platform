import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { cn } from '@/utils/cn'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Topbar sidebarCollapsed={collapsed} />
      <main className={cn(
        'pt-16 min-h-screen transition-all duration-300',
        collapsed ? 'pl-16' : 'pl-64'
      )}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
