import { useQuery } from '@tanstack/react-query'
import { BarChart3, Building2, Download, FileText, TrendingUp, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import { companyApi } from '@/api/company'
import { studentApi } from '@/api/student'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import type { Company, StudentProfile } from '@/types'

interface ReportDef {
  id: 'student-readiness' | 'eligible-students' | 'company-eligibility' | 'placement-analytics'
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const REPORTS: ReportDef[] = [
  { id: 'student-readiness', title: 'Student Readiness Report', description: 'Readiness, ATS, prediction, academics, and profile completion for every student.', icon: <TrendingUp size={22} />, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { id: 'eligible-students', title: 'Eligible Students Report', description: 'Student-company matches after CGPA, backlog, branch, and required-skill checks.', icon: <Users size={22} />, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  { id: 'company-eligibility', title: 'Company Eligibility Report', description: 'Company-wise eligible counts, criteria, packages, and eligibility percentages.', icon: <Building2 size={22} />, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  { id: 'placement-analytics', title: 'Placement Analytics Report', description: 'Branch-wise student totals, eligibility, CGPA, and average readiness.', icon: <BarChart3 size={22} />, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
]

const csvCell = (value: string | number | boolean | null | undefined) => {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

const csvRow = (values: Array<string | number | boolean | null | undefined>) => values.map(csvCell).join(',')

const isEligible = (student: StudentProfile, company: Company) => {
  const studentSkills = new Set(student.skills.map(skill => skill.name.toLowerCase()))
  const branchAllowed = company.eligibleBranches.length === 0 || company.eligibleBranches.some(branch => branch.toLowerCase() === student.branch.toLowerCase())
  const hasSkills = company.requiredSkills.every(skill => studentSkills.has(skill.toLowerCase()))
  return student.currentCgpa >= company.eligibilityCgpa && student.activeBacklogs <= company.maxBacklogsAllowed && branchAllowed && hasSkills
}

const downloadCsv = (filename: string, rows: string[]) => {
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function ReportsPage() {
  const dashboardQuery = useQuery({ queryKey: ['officer-dashboard'], queryFn: () => analyticsApi.getOfficerDashboard().then(r => r.data.data) })
  const studentsQuery = useQuery({ queryKey: ['all-students-report'], queryFn: () => studentApi.getAllStudents({ pageNumber: 1, pageSize: 500 }).then(r => r.data.data) })
  const companiesQuery = useQuery({ queryKey: ['companies-report'], queryFn: () => companyApi.getAll({ pageSize: 500 }).then(r => r.data.data) })
  const readinessQuery = useQuery({ queryKey: ['student-readiness-report'], queryFn: () => analyticsApi.getStudentReadinessReport().then(r => r.data.data) })

  if (dashboardQuery.isLoading || studentsQuery.isLoading || companiesQuery.isLoading || readinessQuery.isLoading) return <PageLoader />

  const dashboard = dashboardQuery.data
  const students = studentsQuery.data ?? []
  const companies = companiesQuery.data ?? []
  const readinessRows = readinessQuery.data ?? []
  const hasError = dashboardQuery.isError || studentsQuery.isError || companiesQuery.isError || readinessQuery.isError

  const eligiblePairs = students.flatMap(student => companies
    .filter(company => isEligible(student, company))
    .map(company => ({ student, company })))

  const generateCsv = (reportId: ReportDef['id']) => {
    const date = new Date().toISOString().slice(0, 10)
    let filename = ''
    let rows: string[] = []

    if (reportId === 'student-readiness') {
      rows = [
        csvRow(['Student Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Backlogs', 'Readiness Score', 'Readiness Level', 'ATS Score', 'Prediction Score', 'Prediction Level', 'Profile Completion %']),
        ...readinessRows.map(row => csvRow([row.studentName, row.email, row.rollNumber, row.branch, row.currentCgpa, row.activeBacklogs, row.readinessScore, row.readinessLevel, row.atsScore, row.predictionScore, row.predictionLevel, row.profileCompletionPercent])),
      ]
      filename = `student-readiness-${date}.csv`
    }

    if (reportId === 'eligible-students') {
      rows = [
        csvRow(['Student Name', 'Email', 'Branch', 'CGPA', 'Company', 'Job Role', 'Package LPA', 'Matched Skills']),
        ...eligiblePairs.map(({ student, company }) => csvRow([`${student.firstName} ${student.lastName}`, student.email, student.branch, student.currentCgpa, company.name, company.jobRole, company.packageLpa, company.requiredSkills.join('; ')])),
      ]
      filename = `eligible-students-${date}.csv`
    }

    if (reportId === 'company-eligibility') {
      rows = [
        csvRow(['Company', 'Job Role', 'Package LPA', 'Minimum CGPA', 'Maximum Backlogs', 'Eligible Branches', 'Required Skills', 'Eligible Students', 'Total Students', 'Eligibility %']),
        ...companies.map(company => {
          const eligibleCount = students.filter(student => isEligible(student, company)).length
          const percentage = students.length ? ((eligibleCount / students.length) * 100).toFixed(1) : 0
          return csvRow([company.name, company.jobRole, company.packageLpa, company.eligibilityCgpa, company.maxBacklogsAllowed, company.eligibleBranches.join('; ') || 'All', company.requiredSkills.join('; '), eligibleCount, students.length, percentage])
        }),
      ]
      filename = `company-eligibility-${date}.csv`
    }

    if (reportId === 'placement-analytics' && dashboard) {
      rows = [
        csvRow(['Branch', 'Total Students', 'Eligible Students', 'Average CGPA', 'Average Readiness Score']),
        ...dashboard.branchAnalytics.map(branch => csvRow([branch.branch || 'Not Set', branch.totalStudents, branch.eligibleStudents, branch.averageCgpa, branch.averageReadinessScore])),
      ]
      filename = `placement-analytics-${date}.csv`
    }

    if (rows.length <= 1) {
      toast.error('No data is available for this report')
      return
    }

    downloadCsv(filename, rows)
    toast.success(`${filename} downloaded`)
  }

  const recordCount = (id: ReportDef['id']) => {
    if (id === 'student-readiness') return readinessRows.length
    if (id === 'eligible-students') return eligiblePairs.length
    if (id === 'company-eligibility') return companies.length
    return dashboard?.branchAnalytics.length ?? 0
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="text-sm text-gray-500 dark:text-gray-400">Generate placement-ready CSV exports from live platform data</p></div>
      </div>

      {hasError && <div className="card border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400">Some report data could not be loaded. Refresh the page before exporting.</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: dashboard?.totalStudents ?? students.length },
          { label: 'Placement Ready', value: dashboard?.placementReadyStudents ?? 0 },
          { label: 'Companies', value: dashboard?.totalCompanies ?? companies.length },
          { label: 'Eligible Matches', value: eligiblePairs.length },
        ].map(item => <div key={item.label} className="card text-center"><p className="text-2xl font-bold text-primary-600">{item.value}</p><p className="text-xs text-gray-500 mt-0.5">{item.label}</p></div>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(report => (
          <div key={report.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${report.color}`}>{report.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-gray-900 dark:text-white mb-1">{report.title}</h3><span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 whitespace-nowrap">{recordCount(report.id)} rows</span></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{report.description}</p>
                <button onClick={() => generateCsv(report.id)} disabled={hasError || recordCount(report.id) === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
                  <Download size={14} /> Download CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dashboard?.branchAnalytics.length ? (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><FileText size={16} className="text-primary-500" /> Branch-wise Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800"><th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Branch</th><th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Students</th><th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Eligible</th><th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Avg CGPA</th><th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Readiness</th></tr></thead>
              <tbody>{dashboard.branchAnalytics.map(branch => <tr key={branch.branch || 'unset'} className="border-b border-gray-50 dark:border-gray-800/50"><td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{branch.branch || 'Not Set'}</td><td className="py-2.5 px-3 text-right">{branch.totalStudents}</td><td className="py-2.5 px-3 text-right text-green-600 font-medium">{branch.eligibleStudents}</td><td className="py-2.5 px-3 text-right">{branch.averageCgpa}</td><td className="py-2.5 px-3 text-right font-bold text-primary-600">{branch.averageReadinessScore}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
