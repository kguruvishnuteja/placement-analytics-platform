import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Calendar, Edit3, MapPin, Plus, Search, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { companyApi } from '@/api/company'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/utils/helpers'
import type { Company, RecruitmentDrive } from '@/types'

type DriveStatus = RecruitmentDrive['status']

interface DriveForm {
  companyId: string
  driveName: string
  driveDate: string
  venue: string
  notes: string
  status: DriveStatus
}

const STATUSES: DriveStatus[] = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']

const toLocalDateTime = (value: string) => {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function DriveManagementPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDrive, setEditingDrive] = useState<RecruitmentDrive | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | DriveStatus>('All')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const drivesQuery = useQuery({
    queryKey: ['drives'],
    queryFn: () => companyApi.getDrives().then(r => r.data.data),
  })

  const companiesQuery = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => companyApi.getAll({ pageSize: 100 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyApi.deleteDrive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] })
      toast.success('Drive deleted')
    },
    onError: () => toast.error('Could not delete the drive'),
  })

  const filteredDrives = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (drivesQuery.data ?? []).filter(drive => {
      const matchesStatus = statusFilter === 'All' || drive.status === statusFilter
      const matchesSearch = !term || [drive.driveName, drive.companyName, drive.venue]
        .some(value => value?.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [drivesQuery.data, search, statusFilter])

  const openCreate = () => {
    setEditingDrive(null)
    setModalOpen(true)
  }

  const openEdit = (drive: RecruitmentDrive) => {
    setEditingDrive(drive)
    setModalOpen(true)
  }

  const handleDelete = (drive: RecruitmentDrive) => {
    if (window.confirm(`Delete "${drive.driveName}"? This action cannot be undone.`))
      deleteMutation.mutate(drive.id)
  }

  if (drivesQuery.isLoading) return <PageLoader />

  const statusVariant = (status: DriveStatus) =>
    status === 'Upcoming' ? 'info' : status === 'Ongoing' ? 'warning' : status === 'Completed' ? 'success' : 'danger'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Recruitment Drives</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Schedule, update, and track placement drives</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Schedule Drive
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map(status => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`card text-center transition-all ${statusFilter === status ? 'ring-2 ring-primary-500' : 'hover:shadow-md'}`}>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {drivesQuery.data?.filter(d => d.status === status).length ?? 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{status}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Search drives, companies, or venues" className="input-field pl-9" />
        </div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | DriveStatus)}
          className="input-field sm:w-48">
          <option value="All">All statuses</option>
          {STATUSES.map(status => <option key={status}>{status}</option>)}
        </select>
      </div>

      {drivesQuery.isError ? (
        <div className="card text-center text-rose-600 dark:text-rose-400">Unable to load recruitment drives.</div>
      ) : !filteredDrives.length ? (
        <div className="card">
          <EmptyState icon={<Calendar size={24} />} title="No drives found"
            description={drivesQuery.data?.length ? 'Try changing the search or status filter.' : 'Schedule your first recruitment drive.'}
            action={!drivesQuery.data?.length ? <button onClick={openCreate} className="btn-primary">Schedule Drive</button> : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrives.map(drive => (
            <div key={drive.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{drive.driveName}</h3>
                    <Badge variant={statusVariant(drive.status)}>{drive.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {drive.companyName}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(drive.driveDate)}</span>
                    {drive.venue && <span className="flex items-center gap-1"><MapPin size={14} /> {drive.venue}</span>}
                  </div>
                  {drive.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{drive.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(drive)} aria-label={`Edit ${drive.driveName}`}
                    className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(drive)} disabled={deleteMutation.isPending}
                    aria-label={`Delete ${drive.driveName}`}
                    className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-40">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DriveModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        companies={companiesQuery.data ?? []} drive={editingDrive} />
    </div>
  )
}

function DriveModal({ isOpen, onClose, companies, drive }: {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  drive: RecruitmentDrive | null
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DriveForm>()

  useEffect(() => {
    if (!isOpen) return
    reset(drive ? {
      companyId: drive.companyId,
      driveName: drive.driveName,
      driveDate: toLocalDateTime(drive.driveDate),
      venue: drive.venue ?? '',
      notes: drive.notes ?? '',
      status: drive.status,
    } : {
      companyId: '', driveName: '', driveDate: '', venue: '', notes: '', status: 'Upcoming',
    })
  }, [drive, isOpen, reset])

  const mutation = useMutation({
    mutationFn: (data: DriveForm) => {
      const payload = { ...data, driveDate: new Date(data.driveDate).toISOString() }
      return drive ? companyApi.updateDrive(drive.id, payload) : companyApi.createDrive(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] })
      toast.success(drive ? 'Drive updated' : 'Drive scheduled')
      onClose()
    },
    onError: () => toast.error(drive ? 'Failed to update drive' : 'Failed to schedule drive'),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={drive ? 'Edit Recruitment Drive' : 'Schedule Recruitment Drive'} size="md">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
        <div>
          <label className="label">Company *</label>
          <select {...register('companyId', { required: 'Select a company' })} className="input-field">
            <option value="">Select company...</option>
            {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
          {errors.companyId && <p className="text-xs text-rose-500 mt-1">{errors.companyId.message}</p>}
        </div>
        <div>
          <label className="label">Drive Name *</label>
          <input {...register('driveName', { required: 'Enter a drive name' })}
            placeholder="Campus placement drive" className="input-field" />
          {errors.driveName && <p className="text-xs text-rose-500 mt-1">{errors.driveName.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Drive Date *</label>
            <input {...register('driveDate', { required: 'Select a date' })} type="datetime-local" className="input-field" />
            {errors.driveDate && <p className="text-xs text-rose-500 mt-1">{errors.driveDate.message}</p>}
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input-field">
              {STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Venue</label>
          <input {...register('venue')} placeholder="Main Auditorium" className="input-field" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea {...register('notes')} rows={3} placeholder="Rounds, documents, or instructions" className="input-field" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending || companies.length === 0} className="btn-primary">
            {mutation.isPending ? 'Saving...' : drive ? 'Update Drive' : 'Schedule Drive'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
