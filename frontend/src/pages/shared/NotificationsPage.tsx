import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Info, Building2, Target, AlertCircle, Calendar } from 'lucide-react'
import { notificationsApi } from '@/api/notifications'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const typeIcon = (type: string) => {
  switch (type) {
    case 'NewCompany':        return <Building2 size={16} />
    case 'EligibilityUpdate': return <Target size={16} />
    case 'SkillRecommendation': return <AlertCircle size={16} />
    case 'UpcomingDrive':     return <Calendar size={16} />
    default:                  return <Info size={16} />
  }
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data.data),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read') },
  })

  if (isLoading) return <PageLoader />

  const unread = notifications?.filter(n => !n.isRead).length ?? 0

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unread > 0 && <p className="text-sm text-primary-600 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={14}/> Mark all read
          </button>
        )}
      </div>

      {!notifications?.length ? (
        <div className="card">
          <EmptyState icon={<Bell size={24}/>} title="No notifications" description="You're all caught up!" />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              className={cn('card cursor-pointer transition-all hover:shadow-md',
                !n.isRead && 'border-l-4 border-primary-500 bg-primary-50/30 dark:bg-primary-900/10')}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}>
              <div className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  n.isRead ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400')}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white')}>
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
