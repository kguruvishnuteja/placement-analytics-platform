import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

interface Props { data: Record<string, number> }

export default function SkillsDistributionChart({ data }: Props) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }))

  if (!chartData.length) return (
    <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
      No skills data available
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={90}
          dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
