// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'Student' | 'PlacementOfficer' | 'Admin'
  isEmailVerified: boolean
  profileImageUrl?: string
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'Student' | 'PlacementOfficer' | 'Admin'
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  branch?: string
  rollNumber?: string
  currentCgpa?: number
  profileCompletionPercent?: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}

// ─── Student ─────────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  phone: string
  branch: string
  section: string
  graduationYear: number
  rollNumber: string
  sscPercentage: number
  intermediatePercentage: number
  currentCgpa: number
  activeBacklogs: number
  leetCodeProfile?: string
  hackerRankProfile?: string
  codeChefProfile?: string
  gitHubProfile?: string
  linkedInProfile?: string
  leetCodeSolved: number
  hackerRankStars: number
  codeChefRating: number
  gitHubRepos: number
  profileCompletionPercent: number
  skills: SkillDto[]
  projects: Project[]
  certifications: Certification[]
  internships: Internship[]
}

export interface SkillDto {
  id: string
  name: string
  category: string
  proficiencyLevel: number
  isVerified: boolean
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
}

export interface Project {
  id: string
  title: string
  description: string
  techStack: string
  gitHubUrl?: string
  liveUrl?: string
  startDate: string
  endDate?: string
  isOngoing: boolean
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
}

export interface Internship {
  id: string
  companyName: string
  role: string
  description: string
  startDate: string
  endDate?: string
  isCurrentlyWorking: boolean
  isPaid: boolean
  stipend?: number
}

// ─── Company ─────────────────────────────────────────────────────────────────
export interface Company {
  id: string
  name: string
  industry: string
  description?: string
  website?: string
  logoUrl?: string
  packageLpa: number
  jobRole: string
  eligibilityCgpa: number
  maxBacklogsAllowed: number
  eligibleBranches: string[]
  requiredSkills: string[]
  isActive: boolean
}

export interface EligibilityResult {
  companyId: string
  companyName: string
  jobRole: string
  packageLpa: number
  isEligible: boolean
  eligibilityPercent: number
  missingSkills: string[]
  reasons: string[]
}

export interface SkillGap {
  companyId: string
  companyName: string
  studentSkills: string[]
  requiredSkills: string[]
  missingSkills: string[]
  matchedSkills: string[]
  matchPercent: number
  recommendations: LearningRecommendation[]
}

export interface LearningRecommendation {
  skillName: string
  priority: 'High' | 'Medium' | 'Low'
  recommendedAction: string
  resources: string[]
}

export interface RecruitmentDrive {
  id: string
  companyId: string
  companyName: string
  driveName: string
  driveDate: string
  venue?: string
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'
  notes?: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface PlacementReadiness {
  studentId: string
  totalScore: number
  academicScore: number
  projectScore: number
  skillScore: number
  resumeScore: number
  codingProfileScore: number
  certificationScore: number
  readinessLevel: string
  readinessDescription: string
  calculatedAt: string
}

export interface PlacementPrediction {
  studentId: string
  predictionScore: number
  predictionLevel: string
  reasoning: string
  predictedAt: string
  history: { score: number; level: string; date: string }[]
}

export interface StudentDashboard {
  readinessScore: number
  readinessLevel: string
  atsScore: number
  eligibleCompaniesCount: number
  profileCompletionPercent: number
  totalSkills: number
  totalProjects: number
  totalCertifications: number
  skillGapSummary: {
    totalCompaniesAnalyzed: number
    eligibleCompanies: number
    topMissingSkills: string[]
    averageMatchPercent: number
  }
  recentRecommendations: string[]
  progressTimeline: { month: string; readinessScore: number; atsScore: number }[]
  skillsDistribution: Record<string, number>
}

export interface OfficerDashboard {
  totalStudents: number
  placementReadyStudents: number
  averageCgpa: number
  totalCompanies: number
  upcomingDrives: number
  branchAnalytics: BranchAnalytics[]
  companyStats: CompanyStats[]
  skillDistribution: Record<string, number>
  placementTrends: { month: string; eligibleStudents: number; highlyCompetitiveStudents: number }[]
}

export interface BranchAnalytics {
  branch: string
  totalStudents: number
  eligibleStudents: number
  averageCgpa: number
  averageReadinessScore: number
}

export interface CompanyStats {
  companyName: string
  eligibleStudents: number
  packageLpa: number
  jobRole: string
}

export interface AdminDashboard {
  totalUsers: number
  totalStudents: number
  totalOfficers: number
  totalCompanies: number
  totalResumesAnalyzed: number
  systemHealth: number
  recentActivities: { activityType: string; description: string; timestamp: string; userName: string }[]
}

export interface StudentReadinessReport {
  studentId: string
  studentName: string
  email: string
  rollNumber: string
  branch: string
  currentCgpa: number
  activeBacklogs: number
  readinessScore: number
  readinessLevel: string
  atsScore: number
  predictionScore: number
  predictionLevel: string
  profileCompletionPercent: number
}

// ─── Resume ──────────────────────────────────────────────────────────────────
export interface ResumeAnalysis {
  id: string
  studentId: string
  fileName: string
  atsScore: number
  formatScore: number
  keywordScore: number
  projectScore: number
  certificationScore: number
  experienceScore: number
  skillMatchScore: number
  extractedSkills: string[]
  extractedProjects: string[]
  extractedCertifications: string[]
  suggestions: ResumeSuggestion[]
  analyzedAt: string
}

export interface ResumeSuggestion {
  category: string
  issue: string
  suggestion: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface ScoringRule {
  id: string
  ruleName: string
  category: string
  weightPercent: number
  isActive: boolean
  description?: string
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: string[]
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}
