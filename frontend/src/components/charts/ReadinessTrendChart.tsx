import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

interface Props {
  data: { month: string; readinessScore: number; atsScore: number }[]
}

export default function ReadinessTrendChart({ data }: Props) {
  if (!data.length) return (
    <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
      No trend data available yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-gray-500" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-gray-500" />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--tw-bg)', borderRadius: '12px', border: '1px solid #e5e7eb' }}
        />
        <Legend />
        <Line type="monotone" dataKey="readinessScore" stroke="#6366f1" strokeWidth={2.5}
          name="Readiness" dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="atsScore" stroke="#22c55e" strokeWidth={2.5}
          name="ATS Score" dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
