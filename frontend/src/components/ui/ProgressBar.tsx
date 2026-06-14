import { cn } from '@/utils/cn'

interface Props {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProgressBar({
  value, max = 100, label, showValue = true, color, size = 'md', className
}: Props) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  const autoColor = !color
    ? pct >= 80 ? 'bg-emerald-500'
    : pct >= 60 ? 'bg-blue-500'
    : pct >= 40 ? 'bg-amber-500'
    : 'bg-rose-500'
    : color

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out', autoColor, heights[size])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
