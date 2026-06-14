import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit2, Building2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { companyApi } from '@/api/company'
import { skillsApi } from '@/api/skills'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import type { Company, Skill } from '@/types'

export default function CompanyManagementPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const qc = useQueryClient()

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies-manage'],
    queryFn: () => companyApi.getAll({ pageSize: 100 }).then(r => r.data.data),
  })

  const { data: skills } = useQuery({
    queryKey: ['all-skills'],
    queryFn: () => skillsApi.getAll().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies-manage'] })
      toast.success('Company deleted')
    },
  })

  if (isLoading) return <PageLoader />

  const filtered = (companies ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.jobRole.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add and manage placement companies</p>
        </div>
        <button
          onClick={() => { setEditCompany(null); setModalOpen(true) }}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search companies…" className="input-field pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Building2 size={24} />}
            title="No companies yet"
            description="Add your first company to get started"
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                Add Company
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.industry}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditCompany(c); setModalOpen(true) }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Role</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.jobRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Package</span>
                  <span className="font-bold text-green-600 dark:text-green-400">₹{c.packageLpa} LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Min CGPA</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.eligibilityCgpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Max Backlogs</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.maxBacklogsAllowed}</span>
                </div>
              </div>

              {c.requiredSkills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 mb-1.5">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {c.requiredSkills.slice(0, 4).map(s => (
                      <span key={s} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs">
                        {s}
                      </span>
                    ))}
                    {c.requiredSkills.length > 4 && (
                      <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500">
                        +{c.requiredSkills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CompanyModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCompany(null) }}
        company={editCompany}
        skills={skills ?? []}
        qc={qc}
      />
    </div>
  )
}

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
  skills: Skill[]
  qc: ReturnType<typeof useQueryClient>
}

function CompanyModal({ isOpen, onClose, company, skills, qc }: CompanyModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(company?.eligibleBranches ?? [])

  const { register, handleSubmit, reset } = useForm<Company>({
    values: company ?? undefined,
  })

  const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical']

  const toggleSkill = (id: string) =>
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const toggleBranch = (b: string) =>
    setSelectedBranches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])

  const onSubmit = async (data: Company) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        eligibleBranches: selectedBranches,
        requiredSkillIds: selectedSkills,
      }
      if (company) {
        await companyApi.update(company.id, payload)
        toast.success('Company updated')
      } else {
        await companyApi.create(payload)
        toast.success('Company created')
      }
      qc.invalidateQueries({ queryKey: ['companies-manage'] })
      reset()
      onClose()
    } catch {
      toast.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company ? 'Edit Company' : 'Add Company'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Company Name *</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="label">Industry</label>
            <input {...register('industry')} className="input-field" />
          </div>
          <div>
            <label className="label">Job Role *</label>
            <input {...register('jobRole', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="label">Package (LPA) *</label>
            <input {...register('packageLpa', { valueAsNumber: true })} type="number" step="0.1" className="input-field" />
          </div>
          <div>
            <label className="label">Min CGPA *</label>
            <input {...register('eligibilityCgpa', { valueAsNumber: true })} type="number" step="0.1" max="10" className="input-field" />
          </div>
          <div>
            <label className="label">Max Backlogs</label>
            <input {...register('maxBacklogsAllowed', { valueAsNumber: true })} type="number" min="0" className="input-field" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} rows={2} className="input-field" />
        </div>

        <div>
          <label className="label">Website</label>
          <input {...register('website')} type="url" placeholder="https://" className="input-field" />
        </div>

        <div>
          <label className="label">Eligible Branches</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map(b => (
              <button key={b} type="button" onClick={() => toggleBranch(b)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedBranches.includes(b)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                }`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Required Skills</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-1">
            {skills.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(s.id)}
                  onChange={() => toggleSkill(s.id)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
                <span className="text-xs text-gray-400">({s.category})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : company ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
