import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { studentApi } from '@/api/student'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import ProgressBar from '@/components/ui/ProgressBar'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['all-students', page, search],
    queryFn: () => studentApi.getAllStudents({ pageNumber: page, pageSize: 10, searchTerm: search || undefined }).then(r => r.data.data),
  })

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1) }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view all student profiles</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, email, branch…" className="input-field pl-9" />
        </div>
        <button type="submit" className="btn-primary">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="btn-secondary">Clear</button>}
      </form>

      {!data?.length ? (
        <div className="card"><EmptyState icon={<Users size={24}/>} title="No students found" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Branch</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">CGPA</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Backlogs</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Skills</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Profile %</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                      <p className="text-xs text-gray-400">{s.rollNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.branch || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${s.currentCgpa >= 7.5 ? 'text-green-600' : s.currentCgpa >= 6 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {s.currentCgpa || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={s.activeBacklogs === 0 ? 'success' : 'danger'}>{s.activeBacklogs}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{s.skills.length}</td>
                    <td className="py-3 px-4 w-36">
                      <ProgressBar value={s.profileCompletionPercent} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => navigate(`/officer/students/${s.id}`)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-600 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Page {page}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40 flex items-center gap-1 text-xs">
                <ChevronLeft size={14}/> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={(data?.length ?? 0) < 10}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40 flex items-center gap-1 text-xs">
                Next <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
