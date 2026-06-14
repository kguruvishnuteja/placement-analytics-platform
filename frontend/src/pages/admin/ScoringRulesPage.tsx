import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'

export default function ScoringRulesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Record<string, number>>({})

  const { data: rules, isLoading } = useQuery({
    queryKey: ['scoring-rules'],
    queryFn: () => analyticsApi.getScoringRules().then(r => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { weightPercent: number; isActive: boolean } }) =>
      analyticsApi.updateScoringRule(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scoring-rules'] }); toast.success('Rule updated') },
    onError: () => toast.error('Update failed'),
  })

  if (isLoading) return <PageLoader />

  const totalWeight = rules?.reduce((sum, r) => sum + r.weightPercent, 0) ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scoring Rules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure readiness score calculation weights</p>
        </div>
      </div>

      {/* Total weight indicator */}
      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} className="text-primary-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Total Weight: {totalWeight}%</span>
          <span className={`badge ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {totalWeight === 100 ? 'Valid — sums to 100%' : 'Warning — should sum to 100%'}
          </span>
        </div>
        <ProgressBar value={totalWeight} showValue={false} color={totalWeight === 100 ? 'bg-green-500' : 'bg-amber-500'} />
      </div>

      <div className="space-y-4">
        {rules?.map(rule => (
          <div key={rule.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{rule.ruleName}</h3>
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{rule.category}</span>
                </div>
                {rule.description && <p className="text-sm text-gray-500 dark:text-gray-400">{rule.description}</p>}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500">Active</span>
                  <div className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${rule.isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    onClick={() => updateMutation.mutate({ id: rule.id, data: { weightPercent: rule.weightPercent, isActive: !rule.isActive } })}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.isActive ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" max="100" step="5"
                    defaultValue={rule.weightPercent}
                    onChange={e => setEditing(prev => ({ ...prev, [rule.id]: Number(e.target.value) }))}
                    className="input-field w-20 text-center py-1.5 text-sm"
                  />
                  <span className="text-sm text-gray-400">%</span>
                  <button
                    onClick={() => updateMutation.mutate({ id: rule.id, data: { weightPercent: editing[rule.id] ?? rule.weightPercent, isActive: rule.isActive } })}
                    className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1">
                    <Save size={12}/> Save
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={rule.weightPercent} max={100} showValue={false} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
