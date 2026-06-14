import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'

// Layout
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Pages — Auth
import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/auth/LoginPage'
import RegisterPage    from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Pages — Student
import StudentDashboard   from './pages/student/StudentDashboard'
import ProfilePage        from './pages/student/ProfilePage'
import ResumeAnalyzerPage from './pages/student/ResumeAnalyzerPage'
import CompaniesPage      from './pages/student/CompaniesPage'
import SkillGapPage       from './pages/student/SkillGapPage'
import ReadinessPage      from './pages/student/ReadinessPage'
import PredictionPage     from './pages/student/PredictionPage'
import RecommendationsPage from './pages/student/RecommendationsPage'

// Pages — Officer
import OfficerDashboard      from './pages/officer/OfficerDashboard'
import StudentsPage          from './pages/officer/StudentsPage'
import CompanyManagementPage from './pages/officer/CompanyManagementPage'
import DriveManagementPage   from './pages/officer/DriveManagementPage'
import ReportsPage           from './pages/officer/ReportsPage'

// Pages — Admin
import AdminDashboard   from './pages/admin/AdminDashboard'
import ScoringRulesPage from './pages/admin/ScoringRulesPage'
import AdminUsersPage   from './pages/admin/AdminUsersPage'

// Pages — Shared
import NotificationsPage from './pages/shared/NotificationsPage'
import SettingsPage      from './pages/shared/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'PlacementOfficer') return <Navigate to="/officer/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  const { isDark } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/app" element={<RootRedirect />} />

          {/* Protected — App Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              {/* Shared */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Student */}
              <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                <Route path="/student/dashboard"       element={<StudentDashboard />} />
                <Route path="/student/profile"         element={<ProfilePage />} />
                <Route path="/student/resume"          element={<ResumeAnalyzerPage />} />
                <Route path="/student/companies"       element={<CompaniesPage />} />
                <Route path="/student/skill-gap"       element={<SkillGapPage />} />
                <Route path="/student/readiness"       element={<ReadinessPage />} />
                <Route path="/student/prediction"      element={<PredictionPage />} />
                <Route path="/student/certs"           element={<ProfilePage />} />
                <Route path="/student/recommendations" element={<RecommendationsPage />} />
              </Route>

              {/* Officer */}
              <Route element={<ProtectedRoute allowedRoles={['PlacementOfficer', 'Admin']} />}>
                <Route path="/officer/dashboard"  element={<OfficerDashboard />} />
                <Route path="/officer/students"   element={<StudentsPage />} />
                <Route path="/officer/companies"  element={<CompanyManagementPage />} />
                <Route path="/officer/analytics"  element={<OfficerDashboard />} />
                <Route path="/officer/drives"     element={<DriveManagementPage />} />
                <Route path="/officer/reports"    element={<ReportsPage />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/dashboard"     element={<AdminDashboard />} />
                <Route path="/admin/users"         element={<AdminUsersPage />} />
                <Route path="/admin/companies"     element={<CompanyManagementPage />} />
                <Route path="/admin/analytics"     element={<AdminDashboard />} />
                <Route path="/admin/scoring-rules" element={<ScoringRulesPage />} />
                <Route path="/admin/settings"      element={<SettingsPage />} />
              </Route>

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1f2937',
            color: '#f9fafb',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
