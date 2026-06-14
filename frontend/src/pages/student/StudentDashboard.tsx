import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, FileText, Building2, Target, User,
  Award, Code2, Lightbulb, RefreshCw
} from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import StatCard from '@/components/ui/StatCard'
import ScoreRing from '@/components/ui/ScoreRing'
import ProgressBar from '@/components/ui/ProgressBar'
import ReadinessTrendChart from '@/components/charts/ReadinessTrendChart'
import SkillsDistributionChart from '@/components/charts/SkillsDistributionChart'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { readinessLabel, readinessColor } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => analyticsApi.getStudentDashboard().then(r => r.data.data),
  })

  const { data: readiness, refetch: refetchScore } = useQuery({
    queryKey: ['readiness-score'],
    queryFn: () => analyticsApi.getReadinessScore().then(r => r.data.data),
  })

  const handleRecalculate = async () => {
    const t = toast.loading('Calculating score…')
    await refetchScore()
    await refetch()
    toast.success('Score updated!', { id: t })
  }

  if (isLoading) return <PageLoader />

  const d = data!

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your placement readiness at a glance</p>
        </div>
        <button onClick={handleRecalculate}
          className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Recalculate
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Profile Complete" value={`${d.profileCompletionPercent}%`}
          icon={<User size={20} />} color="blue" />
        <StatCard title="Skills Added" value={d.totalSkills}
          icon={<Code2 size={20} />} color="purple" />
        <StatCard title="Projects" value={d.totalProjects}
          icon={<Building2 size={20} />} color="amber" />
        <StatCard title="Certifications" value={d.totalCertifications}
          icon={<Award size={20} />} color="green" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Score */}
        <div className="card flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 self-start">Readiness Score</h3>
          <ScoreRing score={d.readinessScore} size={140} sublabel="/100" />
          <Badge className={readinessColor(d.readinessLevel)}>
            {readinessLabel(d.readinessLevel)}
          </Badge>
          {readiness && (
            <div className="w-full space-y-2">
              <ProgressBar value={readiness.academicScore} label="Academic" size="sm" />
              <ProgressBar value={readiness.skillScore} label="Skills" size="sm" />
              <ProgressBar value={readiness.projectScore} label="Projects" size="sm" />
              <ProgressBar value={readiness.resumeScore} label="Resume" size="sm" />
              <ProgressBar value={readiness.codingProfileScore} label="Coding" size="sm" />
              <ProgressBar value={readiness.certificationScore} label="Certs" size="sm" />
            </div>
          )}
        </div>

        {/* ATS + Eligible */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ATS Score</h3>
            <div className="flex items-center gap-4">
              <ScoreRing score={d.atsScore} size={80} sublabel="ATS" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {d.atsScore >= 70 ? '✅ Good resume score' : d.atsScore >= 50 ? '⚠️ Needs improvement' : '❌ Upload & analyze resume'}
                </p>
                <ProgressBar value={d.atsScore} className="mt-2" size="sm" showValue={false} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Eligible Companies</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Building2 size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{d.eligibleCompaniesCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">companies match your profile</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Skill Gap Summary</h3>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {d.skillGapSummary.eligibleCompanies} / {d.skillGapSummary.totalCompaniesAnalyzed} companies evaluated
              </p>
              {d.skillGapSummary.topMissingSkills.slice(0, 3).map(skill => (
                <span key={skill} className="inline-flex mr-1 mb-1 badge bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                  {skill}
                </span>
              ))}
              {d.skillGapSummary.topMissingSkills.length === 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">No major skill gaps!</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {d.recentRecommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile Completion</span>
            </div>
            <ProgressBar value={d.profileCompletionPercent} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress Timeline</h3>
          </div>
          <ReadinessTrendChart data={d.progressTimeline} />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skills by Category</h3>
          </div>
          <SkillsDistributionChart data={d.skillsDistribution} />
        </div>
      </div>
    </div>
  )
}
