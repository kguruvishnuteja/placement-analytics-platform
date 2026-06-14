import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '@/api/analytics'
import ScoreRing from '@/components/ui/ScoreRing'
import Badge from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { predictionColor, predictionLabel, formatDate } from '@/utils/helpers'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PredictionPage() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: prediction, isLoading, refetch } = useQuery({
    queryKey: ['prediction'],
    queryFn: () => analyticsApi.getPrediction().then(r => r.data.data),
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    const t = toast.loading('Updating prediction…')
    await refetch()
    toast.success('Prediction updated!', { id: t })
    setRefreshing(false)
  }

  if (isLoading) return <PageLoader />
  const p = prediction!

  const historyChartData = p.history.map(h => ({
    date: formatDate(h.date),
    score: h.score,
  })).reverse()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Prediction</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered placement probability assessment</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary flex items-center gap-2 text-sm">
          {refreshing ? <LoadingSpinner size="sm" /> : <RefreshCw size={14} />} Update
        </button>
      </div>

      {/* Prediction result */}
      <div className="card flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={p.predictionScore} size={160} sublabel="%" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{predictionLabel(p.predictionLevel)}</h2>
            <Badge className={predictionColor(p.predictionLevel)}>{predictionLabel(p.predictionLevel)}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{p.reasoning}</p>
          <p className="text-xs text-gray-400">Last updated: {formatDate(p.predictedAt)}</p>
        </div>
      </div>

      {/* Probability tiers */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { level: 'High Chance', range: '70–100%', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', active: p.predictionLevel === 'HighChance' },
          { level: 'Moderate Chance', range: '40–69%', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', active: p.predictionLevel === 'ModerateChance' },
          { level: 'Low Chance', range: '0–39%', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', active: p.predictionLevel === 'LowChance' },
        ].map(tier => (
          <div key={tier.level} className={`p-4 rounded-2xl border-2 transition-all ${tier.color} ${tier.active ? 'ring-2 ring-offset-2 ring-primary-500 scale-105' : 'opacity-60'}`}>
            <p className={`text-sm font-bold ${tier.text}`}>{tier.level}</p>
            <p className={`text-xs ${tier.text} opacity-70 mt-0.5`}>{tier.range}</p>
            {tier.active && <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">← Your Level</p>}
          </div>
        ))}
      </div>

      {/* How it's calculated */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prediction Factors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { factor: 'CGPA', weight: '25%', desc: 'Academic performance' },
            { factor: 'Skills Count', weight: '20%', desc: 'Technical skills added' },
            { factor: 'Projects', weight: '20%', desc: 'Number of projects' },
            { factor: 'ATS Score', weight: '15%', desc: 'Resume quality' },
            { factor: 'Certifications', weight: '10%', desc: 'Professional certs' },
            { factor: 'Coding Activity', weight: '10%', desc: 'LeetCode / HackerRank' },
          ].map(f => (
            <div key={f.factor} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{f.factor}</span>
                <span className="text-xs font-bold text-primary-600">{f.weight}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History chart */}
      {historyChartData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prediction History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historyChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px' }} />
              <Bar dataKey="score" fill="#6366f1" radius={[4,4,0,0]} name="Prediction Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
