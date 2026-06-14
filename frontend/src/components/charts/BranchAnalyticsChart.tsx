import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import type { BranchAnalytics } from '@/types'

interface Props { data: BranchAnalytics[] }

export default function BranchAnalyticsChart({ data }: Props) {
  if (!data.length) return (
    <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
      No branch data available
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
        <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
        <Legend />
        <Bar dataKey="totalStudents" name="Total" fill="#6366f1" radius={[4,4,0,0]} />
        <Bar dataKey="eligibleStudents" name="Eligible" fill="#22c55e" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
