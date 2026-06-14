import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { resumeApi } from '@/api/resume'
import ScoreRing from '@/components/ui/ScoreRing'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import LoadingSpinner, { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/utils/helpers'

export default function ResumeAnalyzerPage() {
  const [uploading, setUploading] = useState(false)

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['resume-latest'],
    queryFn: () => resumeApi.getLatest().then(r => r.data.data).catch(() => null),
  })

  const { data: history } = useQuery({
    queryKey: ['resume-history'],
    queryFn: () => resumeApi.getHistory().then(r => r.data.data),
  })

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return
    setUploading(true)
    const t = toast.loading('Analyzing resume…')
    try {
      await resumeApi.upload(files[0])
      await refetch()
      toast.success('Resume analyzed successfully!', { id: t })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed'
      toast.error(msg, { id: t })
    } finally {
      setUploading(false)
    }
  }, [refetch])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  if (isLoading) return <PageLoader />

  const priorityVariant = (p: string) =>
    p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'success'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resume Analyzer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload your resume for ATS score and improvement tips</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing your resume…</p>
          </div>
        ) : (
          <>
            <Upload size={36} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume, or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, DOCX · Max 10MB</p>
          </>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">ATS Score — {analysis.fileName}</h2>
              <span className="text-xs text-gray-400">{formatDate(analysis.analyzedAt)}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={analysis.atsScore} size={140} sublabel="ATS" />
              <div className="flex-1 w-full space-y-3">
                <ProgressBar value={analysis.formatScore} label="Format & Structure" />
                <ProgressBar value={analysis.keywordScore} label="Keywords" />
                <ProgressBar value={analysis.projectScore} label="Projects" />
                <ProgressBar value={analysis.certificationScore} label="Certifications" />
                <ProgressBar value={analysis.experienceScore} label="Experience" />
                <ProgressBar value={analysis.skillMatchScore} label="Skill Match" />
              </div>
            </div>
          </div>

          {/* Extracted Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-500" /> Extracted Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.extractedSkills.map(s => (
                  <span key={s} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">{s}</span>
                ))}
                {analysis.extractedSkills.length === 0 && <p className="text-sm text-gray-400">None detected</p>}
              </div>
            </div>
            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-green-500" /> Projects Found
              </h3>
              {analysis.extractedProjects.length > 0 ? (
                <ul className="space-y-1">
                  {analysis.extractedProjects.map((p, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400 truncate">• {p}</li>)}
                </ul>
              ) : <p className="text-sm text-gray-400">None detected</p>}
            </div>
            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500" /> Certifications
              </h3>
              {analysis.extractedCertifications.length > 0 ? (
                <ul className="space-y-1">
                  {analysis.extractedCertifications.map((c, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400 truncate">• {c}</li>)}
                </ul>
              ) : <p className="text-sm text-gray-400">None detected</p>}
            </div>
          </div>

          {/* Suggestions */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" /> Improvement Suggestions
            </h2>
            {analysis.suggestions.length === 0 ? (
              <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-2"><CheckCircle size={16}/>Great resume! No major issues found.</p>
            ) : (
              <div className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Badge variant={priorityVariant(s.priority)} className="flex-shrink-0 mt-0.5">{s.priority}</Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.issue}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{s.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Upload your resume to get started</p>
        </div>
      )}

      {/* History */}
      {history && history.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <RefreshCw size={16} className="text-gray-400" /> Analysis History
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">{h.fileName}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: h.atsScore >= 70 ? '#22c55e' : h.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {h.atsScore}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(h.analyzedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
