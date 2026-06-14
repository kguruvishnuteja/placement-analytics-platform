import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, FileText, Building2, Target, TrendingUp,
  Award, Briefcase, BarChart3, Users, Settings, LogOut, GraduationCap,
  BookOpen, Bell, ChevronLeft, ChevronRight, Shield
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { getInitials } from '@/utils/helpers'

interface NavItem { label: string; to: string; icon: React.ReactNode }

const studentNav: NavItem[] = [
  { label: 'Dashboard',        to: '/student/dashboard',   icon: <LayoutDashboard size={18} /> },
  { label: 'My Profile',       to: '/student/profile',     icon: <User size={18} /> },
  { label: 'Resume Analyzer',  to: '/student/resume',      icon: <FileText size={18} /> },
  { label: 'Companies',        to: '/student/companies',   icon: <Building2 size={18} /> },
  { label: 'Skill Gap',        to: '/student/skill-gap',   icon: <Target size={18} /> },
  { label: 'Readiness Score',  to: '/student/readiness',   icon: <TrendingUp size={18} /> },
  { label: 'Prediction',       to: '/student/prediction',  icon: <BarChart3 size={18} /> },
  { label: 'Certifications',   to: '/student/certs',       icon: <Award size={18} /> },
  { label: 'Recommendations',  to: '/student/recommendations', icon: <BookOpen size={18} /> },
]

const officerNav: NavItem[] = [
  { label: 'Dashboard',        to: '/officer/dashboard',   icon: <LayoutDashboard size={18} /> },
  { label: 'Students',         to: '/officer/students',    icon: <Users size={18} /> },
  { label: 'Companies',        to: '/officer/companies',   icon: <Building2 size={18} /> },
  { label: 'Drives',           to: '/officer/drives',      icon: <Briefcase size={18} /> },
  { label: 'Analytics',        to: '/officer/analytics',   icon: <BarChart3 size={18} /> },
  { label: 'Reports',          to: '/officer/reports',     icon: <FileText size={18} /> },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard',        to: '/admin/dashboard',     icon: <LayoutDashboard size={18} /> },
  { label: 'Users',            to: '/admin/users',         icon: <Users size={18} /> },
  { label: 'Companies',        to: '/admin/companies',     icon: <Building2 size={18} /> },
  { label: 'Analytics',        to: '/admin/analytics',     icon: <BarChart3 size={18} /> },
  { label: 'Scoring Rules',    to: '/admin/scoring-rules', icon: <Shield size={18} /> },
  { label: 'Settings',         to: '/admin/settings',      icon: <Settings size={18} /> },
]

interface Props { collapsed: boolean; onToggle: () => void }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = user?.role === 'Admin'
    ? adminNav
    : user?.role === 'PlacementOfficer'
    ? officerNav
    : studentNav

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
      'flex flex-col transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 h-16 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm truncate">PlaceReady</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
            <GraduationCap size={16} className="text-white" />
          </div>
        )}
        <button onClick={onToggle}
          className={cn('p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors flex-shrink-0', collapsed && 'hidden')}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-700">
          <ChevronRight size={12} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')}>
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1 flex-shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <NavLink to="/notifications"
          className={({ isActive }) => cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')}>
          <Bell size={18} />
          {!collapsed && <span>Notifications</span>}
        </NavLink>
        <NavLink to="/settings"
          className={({ isActive }) => cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')}>
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button onClick={handleLogout}
          className={cn('sidebar-link w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20', collapsed && 'justify-center px-0')}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
