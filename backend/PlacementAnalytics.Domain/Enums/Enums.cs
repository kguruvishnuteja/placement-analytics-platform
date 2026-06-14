namespace PlacementAnalytics.Domain.Enums;

public enum UserRole
{
    Student = 1,
    PlacementOfficer = 2,
    Admin = 3
}

public enum ReadinessLevel
{
    Beginner = 1,
    Improving = 2,
    PlacementReady = 3,
    HighlyCompetitive = 4
}

public enum PredictionLevel
{
    LowChance = 1,
    ModerateChance = 2,
    HighChance = 3
}

public enum NotificationType
{
    NewCompany = 1,
    EligibilityUpdate = 2,
    SkillRecommendation = 3,
    UpcomingDrive = 4,
    General = 5
}

public enum ReportType
{
    StudentReadiness = 1,
    EligibleStudents = 2,
    CompanyEligibility = 3,
    PlacementAnalytics = 4
}

public enum ReportFormat
{
    PDF = 1,
    Excel = 2
}
