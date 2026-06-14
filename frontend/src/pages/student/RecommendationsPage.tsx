import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Award, BookOpen, Building2, Code2, ExternalLink, FileText, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import { companyApi } from '@/api/company'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import { priorityColor } from '@/utils/helpers'

const RESOURCE_LINKS: Record<string, { label: string; url: string }[]> = {
  Java: [{ label: 'Java Documentation', url: 'https://docs.oracle.com/en/java/' }, { label: 'Java Courses', url: 'https://www.coursera.org/search?query=java' }],
  Python: [{ label: 'Python Documentation', url: 'https://docs.python.org' }, { label: 'Python Courses', url: 'https://www.coursera.org/search?query=python' }],
  SQL: [{ label: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/' }, { label: 'SQL Practice', url: 'https://www.hackerrank.com/domains/sql' }],
  Docker: [{ label: 'Docker Documentation', url: 'https://docs.docker.com' }, { label: 'Docker Tutorial', url: 'https://www.docker.com/101-tutorial/' }],
  Algorithms: [{ label: 'LeetCode', url: 'https://leetcode.com/problemset/' }, { label: 'Algorithms Course', url: 'https://www.coursera.org/search?query=algorithms' }],
  AWS: [{ label: 'AWS Skill Builder', url: 'https://skillbuilder.aws/' }, { label: 'AWS Certifications', url: 'https://aws.amazon.com/certification/' }],
}

const getResources = (skill: string) => RESOURCE_LINKS[skill] ?? [
  { label: `${skill} courses`, url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` },
  { label: `${skill} tutorials`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} tutorial`)}` },
]

type Priority = 'High' | 'Medium' | 'Low'

interface Recommendation {
  icon: React.ReactNode
  title: string
  description: string
  action: string
  priority: Priority
  href: string
  linkLabel: string
  skill?: string
}

export default function RecommendationsPage() {
  const dashboardQuery = useQuery({ queryKey: ['student-dashboard'], queryFn: () => analyticsApi.getStudentDashboard().then(r => r.data.data) })
  const readinessQuery = useQuery({ queryKey: ['readiness-score'], queryFn: () => analyticsApi.getReadinessScore().then(r => r.data.data) })
  const eligibilityQuery = useQuery({ queryKey: ['eligible-companies'], queryFn: () => companyApi.getEligibleCompanies().then(r => r.data.data) })

  const recommendations = useMemo<Recommendation[]>(() => {
    const score = readinessQuery.data
    if (!score) return []
    const items: Recommendation[] = []

    if (score.academicScore < 60) items.push({ icon: <TrendingUp size={18} />, title: 'Strengthen academics', description: `Academic component: ${score.academicScore.toFixed(0)}/100.`, action: 'Prioritize weak subjects, clear backlogs, and track your next CGPA target.', priority: 'High', href: '/student/profile', linkLabel: 'Review academics' })
    if (score.projectScore < 50) items.push({ icon: <Code2 size={18} />, title: 'Build portfolio projects', description: `Project component: ${score.projectScore.toFixed(0)}/100.`, action: 'Add one deployed end-to-end project with a clear README, source code, and measurable outcome.', priority: 'High', href: '/student/profile', linkLabel: 'Add a project', skill: 'React' })
    if (score.resumeScore < 60) items.push({ icon: <FileText size={18} />, title: 'Improve ATS performance', description: `Resume component: ${score.resumeScore.toFixed(0)}/100.`, action: 'Run the resume analyzer and resolve high-priority formatting and keyword findings.', priority: 'High', href: '/student/resume', linkLabel: 'Analyze resume' })
    if (score.skillScore < 50) items.push({ icon: <BookOpen size={18} />, title: 'Expand technical skills', description: `Skill component: ${score.skillScore.toFixed(0)}/100.`, action: 'Add verified skills that repeatedly appear in your target companies.', priority: 'Medium', href: '/student/skill-gap', linkLabel: 'Open skill gaps' })
    if (score.codingProfileScore < 40) items.push({ icon: <Code2 size={18} />, title: 'Build coding consistency', description: `Coding profile component: ${score.codingProfileScore.toFixed(0)}/100.`, action: 'Solve three focused problems per day and keep your coding profile links current.', priority: 'Medium', href: '/student/profile', linkLabel: 'Update coding profiles', skill: 'Algorithms' })
    if (score.certificationScore < 40) items.push({ icon: <Award size={18} />, title: 'Add a relevant certification', description: `Certification component: ${score.certificationScore.toFixed(0)}/100.`, action: 'Complete one role-aligned certification and add its verified credential URL.', priority: 'Low', href: '/student/profile', linkLabel: 'Add certification', skill: 'AWS' })

    return items.sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]))
  }, [readinessQuery.data])

  if (dashboardQuery.isLoading || readinessQuery.isLoading || eligibilityQuery.isLoading) return <PageLoader />

  if (dashboardQuery.isError || readinessQuery.isError || eligibilityQuery.isError) {
    return <div className="card text-center text-rose-600 dark:text-rose-400">Unable to build recommendations right now. Please refresh and try again.</div>
  }

  const dashboard = dashboardQuery.data!
  const readiness = readinessQuery.data!
  const eligibility = eligibilityQuery.data ?? []
  const eligibleCompanies = eligibility.filter(item => item.isEligible).sort((a, b) => b.packageLpa - a.packageLpa)
  const nearFitCompanies = eligibility.filter(item => !item.isEligible).sort((a, b) => b.eligibilityPercent - a.eligibilityPercent).slice(0, 3)

  const missingSkills = Object.entries(eligibility.filter(item => !item.isEligible).reduce<Record<string, number>>((acc, item) => {
    item.missingSkills.forEach(skill => { acc[skill] = (acc[skill] ?? 0) + 1 })
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><div><h1 className="page-title">Recommendations</h1><p className="text-sm text-gray-500 dark:text-gray-400">A prioritized action plan based on your live readiness and company eligibility data</p></div></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Readiness', value: `${Math.round(readiness.totalScore)}%`, detail: readiness.readinessLevel },
          { label: 'Profile', value: `${dashboard.profileCompletionPercent}%`, detail: 'completion' },
          { label: 'Eligible Companies', value: eligibleCompanies.length, detail: `of ${eligibility.length}` },
          { label: 'High Priority', value: recommendations.filter(item => item.priority === 'High').length, detail: 'actions' },
        ].map(item => <div key={item.label} className="card"><p className="text-xs text-gray-500">{item.label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p><p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{item.detail}</p></div>)}
      </div>

      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2"><Lightbulb size={18} className="text-amber-500" /><h2 className="font-semibold text-gray-900 dark:text-white">Priority Action Plan</h2></div><span className="text-xs text-gray-500">Lowest scores first</span></div>
        {!recommendations.length ? (
          <div className="text-center py-8"><Target size={32} className="mx-auto text-green-500 mb-3" /><p className="font-semibold text-gray-900 dark:text-white">Your core readiness areas are in good shape</p><p className="text-sm text-gray-500 mt-1">Use the company-fit section below to keep targeting higher-opportunity roles.</p></div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(item => (
              <div key={item.title} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0 shadow-sm text-primary-500">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap"><h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h3><span className={`badge text-xs ${priorityColor(item.priority)}`}>{item.priority}</span></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-2">{item.action}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Link to={item.href} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">{item.linkLabel}</Link>
                      {item.skill && getResources(item.skill).map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"><ExternalLink size={10} /> {resource.label}</a>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {missingSkills.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><BookOpen size={18} className="text-primary-500" /><h2 className="font-semibold text-gray-900 dark:text-white">Highest-Impact Skills</h2></div>
          <div className="space-y-4">
            {missingSkills.map(([skill, count]) => (
              <div key={skill}>
                <div className="flex items-center justify-between gap-3 mb-2"><div><p className="font-medium text-gray-900 dark:text-white">{skill}</p><p className="text-xs text-gray-500">Required by {count} currently unavailable {count === 1 ? 'company' : 'companies'}</p></div><Link to="/student/skill-gap" className="text-xs font-semibold text-primary-600 hover:underline">View gap</Link></div>
                <ProgressBar value={(count / Math.max(...missingSkills.map(([, value]) => value))) * 100} showValue={false} size="sm" />
                <div className="flex flex-wrap gap-3 mt-2">{getResources(skill).map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"><ExternalLink size={10} /> {resource.label}</a>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><Building2 size={18} className="text-green-500" /><h2 className="font-semibold text-gray-900 dark:text-white">Best Current Matches</h2></div>
          {eligibleCompanies.length ? <div className="space-y-3">{eligibleCompanies.slice(0, 4).map(company => <div key={company.companyId} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10"><div><p className="font-medium text-gray-900 dark:text-white">{company.companyName}</p><p className="text-xs text-gray-500">{company.jobRole}</p></div><div className="text-right"><p className="font-bold text-green-600">{company.packageLpa} LPA</p><p className="text-xs text-gray-500">{company.eligibilityPercent}% match</p></div></div>)}</div> : <p className="text-sm text-gray-500">No complete company matches yet. Focus on the highest-impact skills above.</p>}
          <Link to="/student/companies" className="inline-block text-sm font-semibold text-primary-600 hover:underline mt-4">Explore all companies</Link>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4"><Target size={18} className="text-amber-500" /><h2 className="font-semibold text-gray-900 dark:text-white">Closest Opportunities</h2></div>
          {nearFitCompanies.length ? <div className="space-y-3">{nearFitCompanies.map(company => <div key={company.companyId} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-gray-900 dark:text-white">{company.companyName}</p><p className="text-xs text-gray-500">{company.jobRole}</p></div><span className="text-sm font-bold text-amber-600">{company.eligibilityPercent}%</span></div>{company.missingSkills.length > 0 && <p className="text-xs text-gray-500 mt-2">Missing: {company.missingSkills.join(', ')}</p>}{company.reasons.length > 0 && <p className="text-xs text-gray-500 mt-1">{company.reasons[0]}</p>}</div>)}</div> : <p className="text-sm text-gray-500">No near-fit companies are available right now.</p>}
        </div>
      </div>
    </div>
  )
}
