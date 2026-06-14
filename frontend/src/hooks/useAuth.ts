import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore()
  return {
    user,
    isAuthenticated,
    isStudent: user?.role === 'Student',
    isOfficer: user?.role === 'PlacementOfficer',
    isAdmin: user?.role === 'Admin',
    logout,
  }
}
