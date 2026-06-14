import { cn } from '@/utils/cn'

interface Props {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'indigo'
  className?: string
}

const colorMap = {
  blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  rose:   'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
}

export default function StatCard({ title, value, icon, change, changeType = 'neutral', color = 'blue', className }: Props) {
  return (
    <div className={cn('card flex items-center gap-4', className)}>
      <div className={cn('p-3 rounded-xl flex-shrink-0', colorMap[color])}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {change && (
          <p className={cn('text-xs mt-0.5',
            changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
            changeType === 'negative' ? 'text-rose-600 dark:text-rose-400' :
            'text-gray-500 dark:text-gray-400'
          )}>{change}</p>
        )}
      </div>
    </div>
  )
}
