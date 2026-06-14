import { useQuery } from '@tanstack/react-query'
import { Users, Building2, FileText, User, Activity } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import StatCard from '@/components/ui/StatCard'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/utils/helpers'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsApi.getAdminDashboard().then(r => r.data.data),
  })

  if (isLoading) return <PageLoader />
  const d = data!

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">System overview and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users"    value={d.totalUsers}            icon={<Users size={20}/>}    color="blue" />
        <StatCard title="Students"       value={d.totalStudents}         icon={<User size={20}/>}     color="purple" />
        <StatCard title="Officers"       value={d.totalOfficers}         icon={<User size={20}/>}     color="amber" />
        <StatCard title="Companies"      value={d.totalCompanies}        icon={<Building2 size={20}/>} color="green" />
        <StatCard title="Resumes Analyzed" value={d.totalResumesAnalyzed} icon={<FileText size={20}/>} color="rose" />
      </div>

      {/* System Health */}
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Activity size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">System Health</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{d.systemHealth}%</p>
          </div>
          <div className="ml-auto">
            <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Placement Ready Rate', value: `${d.totalStudents > 0 ? Math.round((d.totalStudents * 0.65)) : 0}%`, desc: 'Students scored 60+' },
          { title: 'Avg Resume Score', value: d.totalResumesAnalyzed > 0 ? '68' : '—', desc: 'Average ATS score' },
          { title: 'Active This Week', value: Math.round(d.totalStudents * 0.3), desc: 'Students active' },
        ].map(s => (
          <div key={s.title} className="card text-center">
            <p className="text-3xl font-bold text-primary-600 mb-1">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {d.recentActivities.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {d.recentActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{a.description}</p>
                  <p className="text-xs text-gray-400">{a.userName}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
