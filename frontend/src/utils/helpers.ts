import { format, parseISO } from 'date-fns'

export const formatDate = (date: string) => {
  try { return format(parseISO(date), 'MMM dd, yyyy') } catch { return date }
}

export const formatDateShort = (date: string) => {
  try { return format(parseISO(date), 'MMM yyyy') } catch { return date }
}

export const readinessColor = (level: string) => {
  switch (level) {
    case 'HighlyCompetitive': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'PlacementReady':   return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
    case 'Improving':        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'
    default:                 return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
  }
}

export const readinessLabel = (level: string) => {
  switch (level) {
    case 'HighlyCompetitive': return 'Highly Competitive'
    case 'PlacementReady':   return 'Placement Ready'
    case 'Improving':        return 'Improving'
    default:                 return 'Beginner'
  }
}

export const predictionColor = (level: string) => {
  switch (level) {
    case 'HighChance':     return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'ModerateChance': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'
    default:               return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
  }
}

export const predictionLabel = (level: string) => {
  switch (level) {
    case 'HighChance':     return 'High Chance'
    case 'ModerateChance': return 'Moderate Chance'
    default:               return 'Low Chance'
  }
}

export const scoreToColor = (score: number) => {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export const priorityColor = (priority: string) => {
  switch (priority) {
    case 'High':   return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:       return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
}

export const getInitials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
