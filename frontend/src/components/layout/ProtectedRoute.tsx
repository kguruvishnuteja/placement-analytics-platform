import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  allowedRoles?: ('Student' | 'PlacementOfficer' | 'Admin')[]
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'Admin' ? '/admin/dashboard'
      : user.role === 'PlacementOfficer' ? '/officer/dashboard'
      : '/student/dashboard'
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}
