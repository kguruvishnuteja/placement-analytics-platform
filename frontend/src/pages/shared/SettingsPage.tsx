import { useMutation } from '@tanstack/react-query'
import { Moon, Sun, Save, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

export default function SettingsPage() {
  const { isDark, toggle } = useThemeStore()
  const { user } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string
  }>()

  const newPassword = watch('newPassword')

  const changePwMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => toast.success('Password changed successfully!'),
    onError: () => toast.error('Failed to change password. Check your current password.'),
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Profile Info */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Name</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400">Role</span>
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={20} className="text-primary-500" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
            </div>
          </div>
          <button onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary-500" /> Change Password
        </h2>
        <form onSubmit={handleSubmit(d => changePwMutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))}
          className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input {...register('currentPassword', { required: true })} type="password" className="input-field" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input {...register('newPassword', { required: true, minLength: { value: 8, message: 'Minimum 8 characters' } })} type="password" className="input-field" />
            {errors.newPassword && <p className="text-rose-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input {...register('confirmPassword', { validate: v => v === newPassword || 'Passwords do not match' })} type="password" className="input-field" />
            {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={changePwMutation.isPending} className="btn-primary flex items-center gap-2">
            <Save size={14}/> {changePwMutation.isPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
