import { Link } from 'react-router-dom'
import { GraduationCap, TrendingUp, Target, FileText, Building2, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: <TrendingUp size={22}/>, title: 'Readiness Score', desc: 'AI-powered placement readiness scoring across academics, skills, projects, and more.' },
  { icon: <FileText size={22}/>, title: 'Resume Analyzer', desc: 'Upload your resume for instant ATS scoring and actionable improvement suggestions.' },
  { icon: <Target size={22}/>, title: 'Skill Gap Analysis', desc: 'Compare your skills against company requirements and get a personalized learning path.' },
  { icon: <Building2 size={22}/>, title: 'Company Eligibility', desc: 'See exactly which companies you qualify for and what you need to improve.' },
  { icon: <BarChart3 size={22}/>, title: 'Placement Prediction', desc: 'ML-powered placement prediction with probability scoring and historical tracking.' },
  { icon: <GraduationCap size={22}/>, title: 'Career Roadmap', desc: 'Personalized recommendations and resources to fast-track your placement journey.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">PlaceReady</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Placement Analytics & Career Readiness Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Know exactly{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              where you stand
            </span>{' '}
            for placements
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Assess your placement readiness, identify skill gaps, analyze your resume, and track
            progress toward your dream company — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary py-3 px-8 text-base flex items-center justify-center gap-2">
              Start for Free <ArrowRight size={18}/>
            </Link>
            <Link to="/login" className="btn-secondary py-3 px-8 text-base">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Everything you need for placement success
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Comprehensive tools designed for engineering students and placement teams
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role sections */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Built for everyone involved</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: 'Students', color: 'from-blue-500 to-indigo-600',
                features: ['Track readiness score', 'Analyze resume', 'View skill gaps', 'Check company eligibility', 'Get recommendations'],
              },
              {
                role: 'Placement Officers', color: 'from-purple-500 to-pink-600',
                features: ['Manage students', 'Add companies', 'Track recruitment drives', 'View branch analytics', 'Generate reports'],
              },
              {
                role: 'Administrators', color: 'from-emerald-500 to-teal-600',
                features: ['Manage all users', 'Configure scoring rules', 'System analytics', 'Role management', 'Platform settings'],
              },
            ].map(r => (
              <div key={r.role} className="card">
                <div className={`h-2 rounded-full bg-gradient-to-r ${r.color} mb-4`} />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get placement-ready?</h2>
          <p className="text-primary-100 mb-8">Join thousands of students using PlaceReady to land their dream jobs</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Get Started Free <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <GraduationCap size={12} className="text-white"/>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">PlaceReady</span>
          </div>
          <p className="text-sm text-gray-400">© 2024 Placement Analytics Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
