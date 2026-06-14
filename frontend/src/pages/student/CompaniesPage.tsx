import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, XCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { companyApi } from '@/api/company'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import type { EligibilityResult } from '@/types'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'eligible' | 'ineligible'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: eligibility, isLoading } = useQuery({
    queryKey: ['eligible-companies'],
    queryFn: () => companyApi.getEligibleCompanies().then(r => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const filtered = (eligibility ?? []).filter(e => {
    const matchSearch = e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.jobRole.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : filter === 'eligible' ? e.isEligible : !e.isEligible
    return matchSearch && matchFilter
  })

  const eligibleCount = eligibility?.filter(e => e.isEligible).length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Eligibility</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check which companies you qualify for</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{eligibleCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">eligible</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search companies or roles…" className="input-field pl-9" />
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['all', 'eligible', 'ineligible'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm capitalize transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 size={24}/>} title="No companies found" description="Try adjusting your search or filters" />
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <EligibilityCard key={e.companyId} eligibility={e}
              isExpanded={expanded === e.companyId}
              onToggle={() => setExpanded(expanded === e.companyId ? null : e.companyId)} />
          ))}
        </div>
      )}
    </div>
  )
}

function EligibilityCard({ eligibility: e, isExpanded, onToggle }:
  { eligibility: EligibilityResult; isExpanded: boolean; onToggle: () => void }) {

  return (
    <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={onToggle}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${e.isEligible ? 'bg-green-50 dark:bg-green-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
          {e.isEligible
            ? <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            : <XCircle size={20} className="text-rose-600 dark:text-rose-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white">{e.companyName}</h3>
            <Badge variant={e.isEligible ? 'success' : 'danger'}>
              {e.isEligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{e.jobRole} · ₹{e.packageLpa} LPA</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold" style={{ color: e.eligibilityPercent >= 75 ? '#22c55e' : e.eligibilityPercent >= 50 ? '#f59e0b' : '#ef4444' }}>
            {e.eligibilityPercent}%
          </p>
          <p className="text-xs text-gray-400">match</p>
        </div>

        <div className="text-gray-400 flex-shrink-0">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3" onClick={ev => ev.stopPropagation()}>
          <ProgressBar value={e.eligibilityPercent} label="Overall Match" />

          {e.missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {e.missingSkills.map(s => (
                  <span key={s} className="badge bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">{s}</span>
                ))}
              </div>
            </div>
          )}

          {e.reasons.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reasons</p>
              <ul className="space-y-1">
                {e.reasons.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {e.isEligible && e.missingSkills.length === 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle size={14} /> You meet all the requirements for this company!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
