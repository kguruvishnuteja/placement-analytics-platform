import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Edit3, GraduationCap, Power, Search, Shield, Trash2, UserPlus, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { adminApi } from '@/api/admin'
import { analyticsApi } from '@/api/analytics'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/utils/helpers'
import type { AdminUser } from '@/types'

type UserRole = AdminUser['role']

interface UserForm {
  email: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  isActive: boolean
}

const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; variant: 'info' | 'warning' | 'purple' }> = {
  Student: { label: 'Student', icon: <GraduationCap size={12} />, variant: 'info' },
  PlacementOfficer: { label: 'Placement Officer', icon: <Briefcase size={12} />, variant: 'warning' },
  Admin: { label: 'Admin', icon: <Shield size={12} />, variant: 'purple' },
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore(state => state.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [role, setRole] = useState<'All' | UserRole>('All')
  const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, searchTerm, role, status],
    queryFn: () => adminApi.getUsers({
      pageNumber: page,
      pageSize: 20,
      searchTerm: searchTerm || undefined,
      role: role === 'All' ? undefined : role,
      isActive: status === 'All' ? undefined : status === 'Active',
    }).then(response => response.data.data),
  })

  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsApi.getAdminDashboard().then(response => response.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: (user: AdminUser) => adminApi.updateUser(user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: !user.isActive,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Could not update user status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('User deleted')
    },
    onError: () => toast.error('Could not delete user'),
  })

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setSearchTerm(search.trim())
    setPage(1)
  }

  const changeRole = (value: 'All' | UserRole) => { setRole(value); setPage(1) }
  const changeStatus = (value: 'All' | 'Active' | 'Inactive') => { setStatus(value); setPage(1) }
  const openCreate = () => { setEditingUser(null); setModalOpen(true) }
  const openEdit = (user: AdminUser) => { setEditingUser(user); setModalOpen(true) }

  const handleDelete = (user: AdminUser) => {
    if (window.confirm(`Delete ${user.firstName} ${user.lastName}? Their account will no longer be accessible.`))
      deleteMutation.mutate(user.id)
  }

  if (usersQuery.isLoading) return <PageLoader />

  const dashboard = dashboardQuery.data
  const users = usersQuery.data ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gap-4 flex-wrap">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage students, placement officers, and administrators</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: dashboard?.totalUsers ?? 0, icon: <Users size={18} />, color: 'text-primary-600' },
          { label: 'Students', value: dashboard?.totalStudents ?? 0, icon: <GraduationCap size={18} />, color: 'text-blue-600' },
          { label: 'Officers', value: dashboard?.totalOfficers ?? 0, icon: <Briefcase size={18} />, color: 'text-amber-600' },
          { label: 'Admins', value: Math.max(0, (dashboard?.totalUsers ?? 0) - (dashboard?.totalStudents ?? 0) - (dashboard?.totalOfficers ?? 0)), icon: <Shield size={18} />, color: 'text-purple-600' },
        ].map(item => (
          <div key={item.label} className="card flex items-center gap-3">
            <div className={`${item.color}`}>{item.icon}</div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Search name, email, or roll number" className="input-field pl-9" />
        </div>
        <select value={role} onChange={event => changeRole(event.target.value as 'All' | UserRole)} className="input-field lg:w-48">
          <option value="All">All roles</option>
          <option value="Student">Students</option>
          <option value="PlacementOfficer">Placement Officers</option>
          <option value="Admin">Admins</option>
        </select>
        <select value={status} onChange={event => changeStatus(event.target.value as 'All' | 'Active' | 'Inactive')} className="input-field lg:w-40">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(searchTerm || role !== 'All' || status !== 'All') && (
          <button type="button" onClick={() => { setSearch(''); setSearchTerm(''); setRole('All'); setStatus('All'); setPage(1) }} className="btn-secondary">Clear</button>
        )}
      </form>

      {usersQuery.isError ? (
        <div className="card text-center text-rose-600 dark:text-rose-400">Unable to load users.</div>
      ) : !users.length ? (
        <div className="card"><EmptyState icon={<Users size={24} />} title="No users found" description="Try changing the current filters." /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Student Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const meta = roleMeta[user.role]
                  const isSelf = currentUser?.id === user.id
                  return (
                    <tr key={user.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold flex-shrink-0">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}{isSelf && <span className="text-xs text-gray-400 ml-1">(you)</span>}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge variant={meta.variant} className="gap-1">{meta.icon}{meta.label}</Badge></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {user.role === 'Student' ? (
                          <div><p>{user.branch || 'Branch not set'}{user.rollNumber ? ` · ${user.rollNumber}` : ''}</p><p className="text-xs">CGPA: {user.currentCgpa || 'Not set'} · Profile: {user.profileCompletionPercent ?? 0}%</p></div>
                        ) : <span className="text-gray-400">Not applicable</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4 text-center"><Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20" aria-label={`Edit ${user.firstName}`}><Edit3 size={15} /></button>
                          <button onClick={() => updateMutation.mutate(user)} disabled={isSelf || updateMutation.isPending}
                            className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-30" aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}><Power size={15} /></button>
                          <button onClick={() => handleDelete(user)} disabled={isSelf || deleteMutation.isPending}
                            className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-30" aria-label={`Delete ${user.firstName}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Showing {users.length} users · Page {page}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(value => value + 1)} disabled={users.length < 20} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} />
    </div>
  )
}

function UserModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: AdminUser | null }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>()

  useEffect(() => {
    if (!isOpen) return
    reset(user ? {
      email: user.email, firstName: user.firstName, lastName: user.lastName,
      role: user.role, isActive: user.isActive, password: '',
    } : {
      email: '', firstName: '', lastName: '', role: 'Student', isActive: true, password: '',
    })
  }, [isOpen, reset, user])

  const mutation = useMutation({
    mutationFn: (data: UserForm) => user
      ? adminApi.updateUser(user.id, data)
      : adminApi.createUser({ ...data, password: data.password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(user ? 'User updated' : 'User created')
      onClose()
    },
    onError: () => toast.error(user ? 'Could not update user' : 'Could not create user'),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Add User'} size="md">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">First Name *</label><input {...register('firstName', { required: 'Enter a first name' })} className="input-field" />{errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName.message}</p>}</div>
          <div><label className="label">Last Name *</label><input {...register('lastName', { required: 'Enter a last name' })} className="input-field" />{errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName.message}</p>}</div>
        </div>
        <div><label className="label">Email *</label><input {...register('email', { required: 'Enter an email address', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} type="email" className="input-field" />{errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}</div>
        {!user && <div><label className="label">Temporary Password *</label><input {...register('password', { required: 'Enter a temporary password', minLength: { value: 8, message: 'Use at least 8 characters' } })} type="password" className="input-field" />{errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Role</label><select {...register('role')} className="input-field"><option value="Student">Student</option><option value="PlacementOfficer">Placement Officer</option><option value="Admin">Admin</option></select></div>
          {user && <label className="flex items-center gap-2 mt-7 text-sm text-gray-700 dark:text-gray-300"><input {...register('isActive')} type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> Active account</label>}
        </div>
        <div className="flex gap-2 justify-end"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? 'Saving...' : user ? 'Update User' : 'Create User'}</button></div>
      </form>
    </Modal>
  )
}
