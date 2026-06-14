import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, GraduationCap, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
        </div>

        <div className="card shadow-xl border-0">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Forgot password?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@college.edu" className="input-field" required />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                  {loading ? <LoadingSpinner size="sm" /> : <Mail size={16} />}
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
