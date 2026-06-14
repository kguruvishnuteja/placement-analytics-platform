import { scoreToColor } from '@/utils/helpers'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export default function ScoreRing({ score, size = 120, strokeWidth = 10, label, sublabel }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreToColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700" />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(score)}</span>
          {sublabel && <span className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</span>}
        </div>
      </div>
      {label && <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">{label}</p>}
    </div>
  )
}
