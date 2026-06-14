import { Moon, Sun, Bell, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/utils/helpers'
import { cn } from '@/utils/cn'

interface Props { sidebarCollapsed: boolean }

export default function Topbar({ sidebarCollapsed }: Props) {
  const { isDark, toggle } = useThemeStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className={cn(
      'fixed top-0 right-0 h-16 bg-white dark:bg-gray-900',
      'border-b border-gray-100 dark:border-gray-800 z-30',
      'flex items-center justify-between px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-16' : 'left-64'
    )}>
      {/* Search */}
      <div className="relative hidden sm:flex items-center">
        <Search size={16} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search students, companies…"
          className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode */}
        <button onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <button onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold hover:bg-primary-700 transition-colors">
            {getInitials(user.firstName, user.lastName)}
          </button>
        )}
      </div>
    </header>
  )
}
