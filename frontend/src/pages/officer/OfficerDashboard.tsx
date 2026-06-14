import { useQuery } from '@tanstack/react-query'
import { Users, Building2, TrendingUp, GraduationCap, Briefcase } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import StatCard from '@/components/ui/StatCard'
import BranchAnalyticsChart from '@/components/charts/BranchAnalyticsChart'
import SkillsDistributionChart from '@/components/charts/SkillsDistributionChart'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function OfficerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['officer-dashboard'],
    queryFn: () => analyticsApi.getOfficerDashboard().then(r => r.data.data),
  })

  if (isLoading) return <PageLoader />
  const d = data!

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Officer Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of placement readiness across all students</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={d.totalStudents} icon={<Users size={20}/>} color="blue" />
        <StatCard title="Placement Ready" value={d.placementReadyStudents} icon={<GraduationCap size={20}/>} color="green" />
        <StatCard title="Avg CGPA" value={d.averageCgpa.toFixed(2)} icon={<TrendingUp size={20}/>} color="purple" />
        <StatCard title="Companies" value={d.totalCompanies} icon={<Building2 size={20}/>} color="amber" />
        <StatCard title="Upcoming Drives" value={d.upcomingDrives} icon={<Briefcase size={20}/>} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Branch-wise Analytics</h3>
          <BranchAnalyticsChart data={d.branchAnalytics} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Skills Distribution</h3>
          <SkillsDistributionChart data={d.skillDistribution} />
        </div>
      </div>

      {/* Company stats */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company-wise Eligible Students</h3>
        {d.companyStats.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No company data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Job Role</th>
                  <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Package</th>
                  <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Eligible Students</th>
                </tr>
              </thead>
              <tbody>
                {d.companyStats.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="py-2.5 font-medium text-gray-900 dark:text-white">{c.companyName}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{c.jobRole}</td>
                    <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">₹{c.packageLpa} LPA</td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-green-600 dark:text-green-400">{c.eligibleStudents}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Branch table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Branch Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Branch</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Eligible</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Avg CGPA</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {d.branchAnalytics.map((b, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-2.5 font-medium text-gray-900 dark:text-white">{b.branch || 'Unknown'}</td>
                  <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{b.totalStudents}</td>
                  <td className="py-2.5 text-right text-green-600 dark:text-green-400 font-medium">{b.eligibleStudents}</td>
                  <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{b.averageCgpa}</td>
                  <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{b.averageReadinessScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
