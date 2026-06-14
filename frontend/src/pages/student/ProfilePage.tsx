import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Save, Plus, Trash2, ExternalLink, Github, Linkedin, Code2, Award, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentApi } from '@/api/student'
import { skillsApi } from '@/api/skills'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import type { StudentProfile, Skill, Project, Certification } from '@/types'
import { formatDate } from '@/utils/helpers'

export default function ProfilePage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'coding' | 'skills' | 'projects' | 'certs'>('personal')
  const [skillModal, setSkillModal] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [certModal, setCertModal] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.getProfile().then(r => r.data.data),
  })

  const { data: allSkills } = useQuery({
    queryKey: ['all-skills'],
    queryFn: () => skillsApi.getAll().then(r => r.data.data),
  })

  const { register, handleSubmit } = useForm<StudentProfile>({ values: profile })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<StudentProfile>) => studentApi.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-profile'] }); toast.success('Profile saved!') },
    onError: () => toast.error('Failed to save profile'),
  })

  const removeSkillMutation = useMutation({
    mutationFn: (skillId: string) => studentApi.removeSkill(skillId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-profile'] }); toast.success('Skill removed') },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-profile'] }); toast.success('Project deleted') },
  })

  const deleteCertMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteCertification(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-profile'] }); toast.success('Certification removed') },
  })

  if (isLoading) return <PageLoader />

  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'academic', label: 'Academic' },
    { id: 'coding', label: 'Coding Profiles' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'certs', label: 'Certifications' },
  ] as const

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your placement profile</p>
        </div>
      </div>

      {/* Completion */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
          <span className="text-sm font-bold text-primary-600">{profile?.profileCompletionPercent}%</span>
        </div>
        <ProgressBar value={profile?.profileCompletionPercent ?? 0} showValue={false} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 pb-px">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))}>
        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Roll Number</label><input {...register('rollNumber')} className="input-field" /></div>
              <div><label className="label">Phone</label><input {...register('phone')} className="input-field" /></div>
              <div><label className="label">Branch</label><input {...register('branch')} className="input-field" /></div>
              <div><label className="label">Section</label><input {...register('section')} className="input-field" /></div>
              <div><label className="label">Graduation Year</label>
                <input {...register('graduationYear', { valueAsNumber: true })} type="number" className="input-field" /></div>
            </div>
            <SaveButton loading={updateMutation.isPending} />
          </div>
        )}

        {/* Academic Tab */}
        {activeTab === 'academic' && (
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="label">SSC Percentage</label>
                <input {...register('sscPercentage', { valueAsNumber: true })} type="number" step="0.01" className="input-field" /></div>
              <div><label className="label">Intermediate %</label>
                <input {...register('intermediatePercentage', { valueAsNumber: true })} type="number" step="0.01" className="input-field" /></div>
              <div><label className="label">Current CGPA</label>
                <input {...register('currentCgpa', { valueAsNumber: true })} type="number" step="0.01" max="10" className="input-field" /></div>
              <div><label className="label">Active Backlogs</label>
                <input {...register('activeBacklogs', { valueAsNumber: true })} type="number" min="0" className="input-field" /></div>
            </div>
            <SaveButton loading={updateMutation.isPending} />
          </div>
        )}

        {/* Coding Tab */}
        {activeTab === 'coding' && (
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'gitHubProfile' as const, label: 'GitHub URL', icon: <Github size={14}/> },
                { field: 'linkedInProfile' as const, label: 'LinkedIn URL', icon: <Linkedin size={14}/> },
                { field: 'leetCodeProfile' as const, label: 'LeetCode URL', icon: <Code2 size={14}/> },
                { field: 'hackerRankProfile' as const, label: 'HackerRank URL', icon: <Code2 size={14}/> },
                { field: 'codeChefProfile' as const, label: 'CodeChef URL', icon: <Code2 size={14}/> },
              ].map(({ field, label, icon }) => (
                <div key={field}>
                  <label className="label flex items-center gap-1">{icon}{label}</label>
                  <input {...register(field)} type="url" className="input-field" placeholder="https://" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div><label className="label">LeetCode Solved</label>
                <input {...register('leetCodeSolved', { valueAsNumber: true })} type="number" className="input-field" /></div>
              <div><label className="label">HackerRank Stars</label>
                <input {...register('hackerRankStars', { valueAsNumber: true })} type="number" className="input-field" /></div>
              <div><label className="label">CodeChef Rating</label>
                <input {...register('codeChefRating', { valueAsNumber: true })} type="number" className="input-field" /></div>
              <div><label className="label">GitHub Repos</label>
                <input {...register('gitHubRepos', { valueAsNumber: true })} type="number" className="input-field" /></div>
            </div>
            <SaveButton loading={updateMutation.isPending} />
          </div>
        )}
      </form>

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Technical Skills</h3>
            <button onClick={() => setSkillModal(true)} className="btn-primary flex items-center gap-1 text-sm py-1.5">
              <Plus size={14} /> Add Skill
            </button>
          </div>
          {profile?.skills.length === 0 ? (
            <EmptyState icon={<Code2 size={24}/>} title="No skills added" description="Add your technical skills to improve your readiness score" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-100 dark:border-primary-800">
                  <span className="text-sm text-primary-700 dark:text-primary-300">{skill.name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full mx-px ${i < skill.proficiencyLevel ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <button onClick={() => removeSkillMutation.mutate(skill.id)}
                    className="text-gray-400 hover:text-rose-500 transition-colors ml-0.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setProjectModal(true)} className="btn-primary flex items-center gap-1 text-sm">
              <Plus size={14} /> Add Project
            </button>
          </div>
          {profile?.projects.length === 0 ? (
            <div className="card"><EmptyState icon={<Briefcase size={24}/>} title="No projects yet" description="Add your projects to showcase your work" /></div>
          ) : (
            profile?.projects.map(p => <ProjectCard key={p.id} project={p} onDelete={() => deleteProjectMutation.mutate(p.id)} />)
          )}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setCertModal(true)} className="btn-primary flex items-center gap-1 text-sm">
              <Plus size={14} /> Add Certification
            </button>
          </div>
          {profile?.certifications.length === 0 ? (
            <div className="card"><EmptyState icon={<Award size={24}/>} title="No certifications" description="Add your certifications to boost your score" /></div>
          ) : (
            profile?.certifications.map(c => <CertCard key={c.id} cert={c} onDelete={() => deleteCertMutation.mutate(c.id)} />)
          )}
        </div>
      )}

      {/* Add Skill Modal */}
      <AddSkillModal isOpen={skillModal} onClose={() => setSkillModal(false)} skills={allSkills ?? []} qc={qc} />
      <AddProjectModal isOpen={projectModal} onClose={() => setProjectModal(false)} qc={qc} />
      <AddCertModal isOpen={certModal} onClose={() => setCertModal(false)} qc={qc} />
    </div>
  )
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
      <Save size={14} /> {loading ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: () => void }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
            {project.isOngoing && <Badge variant="success">Ongoing</Badge>}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {project.techStack.split(',').map(t => (
              <span key={t} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t.trim()}</span>
            ))}
          </div>
          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
            {project.gitHubUrl && <a href={project.gitHubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary-600"><Github size={12}/>GitHub<ExternalLink size={10}/></a>}
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary-600"><ExternalLink size={12}/>Live Demo</a>}
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-rose-500 transition-colors p-1 ml-2 flex-shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function CertCard({ cert, onDelete }: { cert: Certification; onDelete: () => void }) {
  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
          <Award size={18} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{cert.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cert.issuingOrganization} · {formatDate(cert.issueDate)}</p>
          {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">View Credential</a>}
        </div>
      </div>
      <button onClick={onDelete} className="text-gray-400 hover:text-rose-500 transition-colors p-1 flex-shrink-0">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function AddSkillModal({ isOpen, onClose, skills, qc }: { isOpen: boolean; onClose: () => void; skills: Skill[]; qc: ReturnType<typeof useQueryClient> }) {
  const [selected, setSelected] = useState('')
  const [level, setLevel] = useState(3)
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await studentApi.addSkill({ skillId: selected, proficiencyLevel: level })
      qc.invalidateQueries({ queryKey: ['student-profile'] })
      toast.success('Skill added!')
      onClose()
    } catch { toast.error('Failed to add skill') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Skill" size="sm">
      <div className="space-y-4">
        <div>
          <label className="label">Skill</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field">
            <option value="">Select a skill…</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Proficiency Level: {level}/5</label>
          <input type="range" min={1} max={5} value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Beginner</span><span>Expert</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handle} disabled={loading || !selected} className="btn-primary">
            {loading ? 'Adding…' : 'Add Skill'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function AddProjectModal({ isOpen, onClose, qc }: { isOpen: boolean; onClose: () => void; qc: ReturnType<typeof useQueryClient> }) {
  const { register, handleSubmit, reset } = useForm<Omit<Project,'id'>>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: Omit<Project,'id'>) => {
    setLoading(true)
    try {
      await studentApi.addProject(data)
      qc.invalidateQueries({ queryKey: ['student-profile'] })
      toast.success('Project added!')
      reset(); onClose()
    } catch { toast.error('Failed to add project') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input-field" /></div>
        <div><label className="label">Description *</label><textarea {...register('description', { required: true })} rows={3} className="input-field" /></div>
        <div><label className="label">Tech Stack (comma separated)</label><input {...register('techStack')} placeholder="React, Node.js, MongoDB" className="input-field" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">GitHub URL</label><input {...register('gitHubUrl')} type="url" placeholder="https://github.com/…" className="input-field" /></div>
          <div><label className="label">Live URL</label><input {...register('liveUrl')} type="url" placeholder="https://…" className="input-field" /></div>
          <div><label className="label">Start Date</label><input {...register('startDate', { required: true })} type="date" className="input-field" /></div>
          <div><label className="label">End Date</label><input {...register('endDate')} type="date" className="input-field" /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register('isOngoing')} type="checkbox" className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Currently ongoing</span>
        </label>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding…' : 'Add Project'}</button>
        </div>
      </form>
    </Modal>
  )
}

function AddCertModal({ isOpen, onClose, qc }: { isOpen: boolean; onClose: () => void; qc: ReturnType<typeof useQueryClient> }) {
  const { register, handleSubmit, reset } = useForm<Omit<Certification,'id'>>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: Omit<Certification,'id'>) => {
    setLoading(true)
    try {
      await studentApi.addCertification(data)
      qc.invalidateQueries({ queryKey: ['student-profile'] })
      toast.success('Certification added!')
      reset(); onClose()
    } catch { toast.error('Failed to add certification') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Certification" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Certification Name *</label><input {...register('name', { required: true })} className="input-field" /></div>
        <div><label className="label">Issuing Organization *</label><input {...register('issuingOrganization', { required: true })} className="input-field" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Issue Date</label><input {...register('issueDate', { required: true })} type="date" className="input-field" /></div>
          <div><label className="label">Expiry Date</label><input {...register('expiryDate')} type="date" className="input-field" /></div>
        </div>
        <div><label className="label">Credential ID</label><input {...register('credentialId')} className="input-field" /></div>
        <div><label className="label">Credential URL</label><input {...register('credentialUrl')} type="url" className="input-field" /></div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding…' : 'Add Certification'}</button>
        </div>
      </form>
    </Modal>
  )
}
