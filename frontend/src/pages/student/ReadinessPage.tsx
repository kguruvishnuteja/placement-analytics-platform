import { useQuery } from '@tanstack/react-query'
import { TrendingUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import ScoreRing from '@/components/ui/ScoreRing'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { readinessColor, readinessLabel } from '@/utils/helpers'
import { useState } from 'react'

const SCORE_BREAKDOWN = [
  { key: 'academicScore', label: 'Academic Performance', weight: 25, desc: 'CGPA, SSC, Intermediate scores' },
  { key: 'projectScore', label: 'Projects', weight: 20, desc: 'Number and quality of projects' },
  { key: 'skillScore', label: 'Technical Skills', weight: 20, desc: 'Skills added to profile' },
  { key: 'resumeScore', label: 'Resume Quality', weight: 15, desc: 'ATS score from resume analysis' },
  { key: 'codingProfileScore', label: 'Coding Activity', weight: 10, desc: 'LeetCode, HackerRank, CodeChef' },
  { key: 'certificationScore', label: 'Certifications', weight: 10, desc: 'Professional certifications' },
] as const

export default function ReadinessPage() {
  const [recalculating, setRecalculating] = useState(false)

  const { data: readiness, isLoading, refetch } = useQuery({
    queryKey: ['readiness-score'],
    queryFn: () => analyticsApi.getReadinessScore().then(r => r.data.data),
  })

  const handleRecalculate = async () => {
    setRecalculating(true)
    const t = toast.loading('Recalculating…')
    await refetch()
    toast.success('Score updated!', { id: t })
    setRecalculating(false)
  }

  if (isLoading) return <PageLoader />

  const r = readiness!

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Readiness Score</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your placement readiness breakdown</p>
        </div>
        <button onClick={handleRecalculate} disabled={recalculating}
          className="btn-secondary flex items-center gap-2 text-sm">
          {recalculating ? <LoadingSpinner size="sm" /> : <RefreshCw size={14} />}
          Recalculate
        </button>
      </div>

      {/* Main Score */}
      <div className="card flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={r.totalScore} size={160} sublabel="/100" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{r.totalScore.toFixed(1)}</h2>
            <Badge className={readinessColor(r.readinessLevel)}>
              {readinessLabel(r.readinessLevel)}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{r.readinessDescription}</p>

          {/* Level guide */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { range: '0–40', label: 'Beginner', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400' },
              { range: '41–60', label: 'Improving', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
              { range: '61–80', label: 'Placement Ready', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
              { range: '81–100', label: 'Highly Competitive', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
            ].map(l => (
              <div key={l.range} className={`px-2 py-1.5 rounded-lg ${l.color} flex items-center justify-between`}>
                <span>{l.range}</span>
                <span className="font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Score Breakdown</h3>
        <div className="space-y-6">
          {SCORE_BREAKDOWN.map(item => {
            const val = r[item.key as keyof typeof r] as number
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-xs text-gray-400 ml-2">(weight: {item.weight}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{val.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">/100</span>
                    <span className="text-xs text-gray-400 ml-1">→ {(val * item.weight / 100).toFixed(1)} pts</span>
                  </div>
                </div>
                <ProgressBar value={val} showValue={false} />
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Total Score</span>
          <span className="text-xl font-bold text-primary-600">{r.totalScore.toFixed(1)} / 100</span>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-500" /> How to Improve Your Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tip: 'Maintain CGPA above 7.5 for better academic scores', category: 'Academic' },
            { tip: 'Add at least 3 projects with GitHub links', category: 'Projects' },
            { tip: 'Reach 100+ LeetCode problems solved', category: 'Coding' },
            { tip: 'Upload and optimize your resume for ATS', category: 'Resume' },
            { tip: 'Add relevant technical certifications', category: 'Certifications' },
            { tip: 'Add 10+ technical skills to your profile', category: 'Skills' },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex-shrink-0">{t.category}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
