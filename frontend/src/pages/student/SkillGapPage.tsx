import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Target, ExternalLink } from 'lucide-react'
import { companyApi } from '@/api/company'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { priorityColor } from '@/utils/helpers'

export default function SkillGapPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => companyApi.getAll({ pageSize: 50 }).then(r => r.data.data),
  })

  const { data: skillGap, isLoading: gapLoading } = useQuery({
    queryKey: ['skill-gap', selectedCompany],
    queryFn: () => companyApi.getSkillGap(selectedCompany!).then(r => r.data.data),
    enabled: !!selectedCompany,
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Skill Gap Analysis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare your skills against company requirements</p>
        </div>
      </div>

      {/* Company Selector */}
      <div className="card">
        <label className="label">Select Target Company</label>
        <select value={selectedCompany ?? ''} onChange={e => setSelectedCompany(e.target.value || null)}
          className="input-field max-w-sm">
          <option value="">Choose a company…</option>
          {companies?.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.jobRole}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {gapLoading && selectedCompany && (
        <div className="card flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results */}
      {skillGap && !gapLoading && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Gap Analysis — {skillGap.companyName}
              </h2>
              <span className="text-2xl font-bold" style={{ color: skillGap.matchPercent >= 75 ? '#22c55e' : skillGap.matchPercent >= 50 ? '#f59e0b' : '#ef4444' }}>
                {skillGap.matchPercent}%
              </span>
            </div>
            <ProgressBar value={skillGap.matchPercent} label="Skill Match" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Skills</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{skillGap.studentSkills.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Matched</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{skillGap.matchedSkills.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20">
                <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Missing</p>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{skillGap.missingSkills.length}</p>
              </div>
            </div>
          </div>

          {/* Skill comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">✅ Matched Skills</h3>
              {skillGap.matchedSkills.length === 0 ? (
                <p className="text-sm text-gray-400">No skills matched</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.matchedSkills.map(s => (
                    <span key={s} className="badge bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">❌ Missing Skills</h3>
              {skillGap.missingSkills.length === 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400">You have all required skills! 🎉</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.missingSkills.map(s => (
                    <span key={s} className="badge bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {skillGap.recommendations.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Learning Recommendations</h3>
              <div className="space-y-4">
                {skillGap.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${priorityColor(rec.priority)}`}>{rec.priority} Priority</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.skillName}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.recommendedAction}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.resources.map((url, j) => (
                        <a key={j} href={url} target="_blank" rel="noreferrer"
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                          <ExternalLink size={10} /> Resource {j + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedCompany && (
        <EmptyState icon={<Target size={24}/>}
          title="Select a company to analyze"
          description="Choose a company from the dropdown to see your skill gaps and learning path" />
      )}
    </div>
  )
}
