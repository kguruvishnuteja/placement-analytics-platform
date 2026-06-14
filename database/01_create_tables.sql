-- =====================================================
-- Placement Analytics & Career Readiness Platform
-- Database Schema - SQL Server
-- =====================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PlacementAnalyticsDb')
    CREATE DATABASE PlacementAnalyticsDb;
GO

USE PlacementAnalyticsDb;
GO

-- =====================================================
-- USERS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users')
CREATE TABLE Users (
    Id              UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID() PRIMARY KEY,
    Email           NVARCHAR(256)       NOT NULL,
    PasswordHash    NVARCHAR(MAX)       NOT NULL,
    FirstName       NVARCHAR(100)       NOT NULL,
    LastName        NVARCHAR(100)       NOT NULL,
    Role            INT                 NOT NULL DEFAULT 1, -- 1=Student, 2=Officer, 3=Admin
    IsEmailVerified BIT                 NOT NULL DEFAULT 0,
    EmailVerificationToken NVARCHAR(200) NULL,
    EmailVerificationExpiry DATETIME2 NULL,
    PasswordResetToken     NVARCHAR(200) NULL,
    PasswordResetExpiry    DATETIME2 NULL,
    RefreshToken           NVARCHAR(500) NULL,
    RefreshTokenExpiry     DATETIME2 NULL,
    IsActive        BIT                 NOT NULL DEFAULT 1,
    IsDeleted       BIT                 NOT NULL DEFAULT 0,
    ProfileImageUrl NVARCHAR(500)       NULL,
    CreatedAt       DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);
GO

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
GO

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Students')
CREATE TABLE Students (
    Id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    UserId                  UNIQUEIDENTIFIER NOT NULL,
    Phone                   NVARCHAR(20)     NOT NULL DEFAULT '',
    Branch                  NVARCHAR(100)    NOT NULL DEFAULT '',
    Section                 NVARCHAR(10)     NOT NULL DEFAULT '',
    GraduationYear          INT              NOT NULL DEFAULT 0,
    RollNumber              NVARCHAR(50)     NOT NULL DEFAULT '',
    SscPercentage           DECIMAL(5,2)     NOT NULL DEFAULT 0,
    IntermediatePercentage  DECIMAL(5,2)     NOT NULL DEFAULT 0,
    CurrentCgpa             DECIMAL(4,2)     NOT NULL DEFAULT 0,
    ActiveBacklogs          INT              NOT NULL DEFAULT 0,
    LeetCodeProfile         NVARCHAR(500)    NULL,
    HackerRankProfile       NVARCHAR(500)    NULL,
    CodeChefProfile         NVARCHAR(500)    NULL,
    GitHubProfile           NVARCHAR(500)    NULL,
    LinkedInProfile         NVARCHAR(500)    NULL,
    LeetCodeSolved          INT              NOT NULL DEFAULT 0,
    HackerRankStars         INT              NOT NULL DEFAULT 0,
    CodeChefRating          INT              NOT NULL DEFAULT 0,
    GitHubRepos             INT              NOT NULL DEFAULT 0,
    ProfileCompletionPercent INT             NOT NULL DEFAULT 0,
    IsDeleted               BIT              NOT NULL DEFAULT 0,
    CreatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Students_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Students_UserId UNIQUE (UserId)
);
GO

CREATE INDEX IX_Students_Branch ON Students(Branch);
CREATE INDEX IX_Students_Cgpa ON Students(CurrentCgpa);
CREATE INDEX IX_Students_RollNumber ON Students(RollNumber);
GO

-- =====================================================
-- SKILLS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Skills')
CREATE TABLE Skills (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    Name        NVARCHAR(100)    NOT NULL,
    Category    NVARCHAR(100)    NOT NULL,
    Description NVARCHAR(500)    NULL,
    IsDeleted   BIT              NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Skills_Name UNIQUE (Name)
);
GO

-- =====================================================
-- STUDENT SKILLS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StudentSkills')
CREATE TABLE StudentSkills (
    Id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId        UNIQUEIDENTIFIER NOT NULL,
    SkillId          UNIQUEIDENTIFIER NOT NULL,
    ProficiencyLevel INT              NOT NULL DEFAULT 1,
    IsVerified       BIT              NOT NULL DEFAULT 0,
    IsDeleted        BIT              NOT NULL DEFAULT 0,
    CreatedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StudentSkills_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE,
    CONSTRAINT FK_StudentSkills_Skills   FOREIGN KEY (SkillId) REFERENCES Skills(Id),
    CONSTRAINT UQ_StudentSkills UNIQUE (StudentId, SkillId)
);
GO

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects')
CREATE TABLE Projects (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId   UNIQUEIDENTIFIER NOT NULL,
    Title       NVARCHAR(200)    NOT NULL,
    Description NVARCHAR(2000)   NOT NULL DEFAULT '',
    TechStack   NVARCHAR(500)    NOT NULL DEFAULT '',
    GitHubUrl   NVARCHAR(500)    NULL,
    LiveUrl     NVARCHAR(500)    NULL,
    StartDate   DATETIME2        NOT NULL,
    EndDate     DATETIME2        NULL,
    IsOngoing   BIT              NOT NULL DEFAULT 0,
    IsDeleted   BIT              NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Projects_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- CERTIFICATIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Certifications')
CREATE TABLE Certifications (
    Id                    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId             UNIQUEIDENTIFIER NOT NULL,
    Name                  NVARCHAR(200)    NOT NULL,
    IssuingOrganization   NVARCHAR(200)    NOT NULL,
    IssueDate             DATETIME2        NOT NULL,
    ExpiryDate            DATETIME2        NULL,
    CredentialId          NVARCHAR(200)    NULL,
    CredentialUrl         NVARCHAR(500)    NULL,
    IsDeleted             BIT              NOT NULL DEFAULT 0,
    CreatedAt             DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt             DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Certifications_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- INTERNSHIPS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Internships')
CREATE TABLE Internships (
    Id                 UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId          UNIQUEIDENTIFIER NOT NULL,
    CompanyName        NVARCHAR(200)    NOT NULL,
    Role               NVARCHAR(200)    NOT NULL,
    Description        NVARCHAR(2000)   NOT NULL DEFAULT '',
    StartDate          DATETIME2        NOT NULL,
    EndDate            DATETIME2        NULL,
    IsCurrentlyWorking BIT              NOT NULL DEFAULT 0,
    IsPaid             BIT              NOT NULL DEFAULT 0,
    Stipend            DECIMAL(10,2)    NULL,
    IsDeleted          BIT              NOT NULL DEFAULT 0,
    CreatedAt          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Internships_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Companies')
CREATE TABLE Companies (
    Id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    Name                 NVARCHAR(200)    NOT NULL,
    Industry             NVARCHAR(100)    NOT NULL DEFAULT '',
    Description          NVARCHAR(2000)   NULL,
    Website              NVARCHAR(500)    NULL,
    LogoUrl              NVARCHAR(500)    NULL,
    PackageLpa           DECIMAL(6,2)     NOT NULL DEFAULT 0,
    JobRole              NVARCHAR(200)    NOT NULL DEFAULT '',
    EligibilityCgpa      DECIMAL(4,2)     NOT NULL DEFAULT 6.0,
    MaxBacklogsAllowed   INT              NOT NULL DEFAULT 0,
    EligibleBranches     NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    IsActive             BIT              NOT NULL DEFAULT 1,
    IsDeleted            BIT              NOT NULL DEFAULT 0,
    CreatedByUserId      UNIQUEIDENTIFIER NOT NULL,
    CreatedAt            DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt            DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_Companies_Name ON Companies(Name);
GO

-- =====================================================
-- COMPANY SKILLS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CompanySkills')
CREATE TABLE CompanySkills (
    Id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    CompanyId            UNIQUEIDENTIFIER NOT NULL,
    SkillId              UNIQUEIDENTIFIER NOT NULL,
    IsRequired           BIT              NOT NULL DEFAULT 1,
    MinProficiencyLevel  INT              NOT NULL DEFAULT 1,
    IsDeleted            BIT              NOT NULL DEFAULT 0,
    CreatedAt            DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt            DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_CompanySkills_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CompanySkills_Skills    FOREIGN KEY (SkillId) REFERENCES Skills(Id),
    CONSTRAINT UQ_CompanySkills UNIQUE (CompanyId, SkillId)
);
GO

-- =====================================================
-- RECRUITMENT DRIVES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RecruitmentDrives')
CREATE TABLE RecruitmentDrives (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    CompanyId   UNIQUEIDENTIFIER NOT NULL,
    DriveName   NVARCHAR(200)    NOT NULL,
    DriveDate   DATETIME2        NOT NULL,
    Venue       NVARCHAR(500)    NULL,
    Status      NVARCHAR(50)     NOT NULL DEFAULT 'Upcoming',
    Notes       NVARCHAR(2000)   NULL,
    IsDeleted   BIT              NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_RecruitmentDrives_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- STUDENT ELIGIBILITY
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StudentEligibilities')
CREATE TABLE StudentEligibilities (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId           UNIQUEIDENTIFIER NOT NULL,
    CompanyId           UNIQUEIDENTIFIER NOT NULL,
    IsEligible          BIT              NOT NULL DEFAULT 0,
    EligibilityPercent  DECIMAL(5,2)     NOT NULL DEFAULT 0,
    MissingSkills       NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    Reasons             NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    EvaluatedAt         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StudentEligibilities_Students  FOREIGN KEY (StudentId) REFERENCES Students(Id),
    CONSTRAINT FK_StudentEligibilities_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
);
GO

CREATE INDEX IX_StudentEligibilities_StudentCompany ON StudentEligibilities(StudentId, CompanyId);
GO

-- =====================================================
-- SCORING RULES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ScoringRules')
CREATE TABLE ScoringRules (
    Id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    RuleName      NVARCHAR(200)    NOT NULL,
    Category      NVARCHAR(100)    NOT NULL,
    WeightPercent DECIMAL(5,2)     NOT NULL,
    IsActive      BIT              NOT NULL DEFAULT 1,
    Description   NVARCHAR(500)    NULL,
    IsDeleted     BIT              NOT NULL DEFAULT 0,
    CreatedAt     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt     DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);
GO

-- =====================================================
-- RESUME ANALYSES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ResumeAnalyses')
CREATE TABLE ResumeAnalyses (
    Id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId               UNIQUEIDENTIFIER NOT NULL,
    FileName                NVARCHAR(500)    NOT NULL,
    FileUrl                 NVARCHAR(500)    NOT NULL,
    ExtractedText           NVARCHAR(MAX)    NOT NULL DEFAULT '',
    ExtractedSkills         NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    ExtractedProjects       NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    ExtractedCertifications NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    AtsScore                INT              NOT NULL DEFAULT 0,
    FormatScore             INT              NOT NULL DEFAULT 0,
    KeywordScore            INT              NOT NULL DEFAULT 0,
    ProjectScore            INT              NOT NULL DEFAULT 0,
    CertificationScore      INT              NOT NULL DEFAULT 0,
    ExperienceScore         INT              NOT NULL DEFAULT 0,
    SkillMatchScore         INT              NOT NULL DEFAULT 0,
    Suggestions             NVARCHAR(MAX)    NOT NULL DEFAULT '[]',
    IsLatest                BIT              NOT NULL DEFAULT 1,
    IsDeleted               BIT              NOT NULL DEFAULT 0,
    CreatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ResumeAnalyses_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- PLACEMENT SCORES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlacementScores')
CREATE TABLE PlacementScores (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId           UNIQUEIDENTIFIER NOT NULL,
    TotalScore          DECIMAL(5,2)     NOT NULL DEFAULT 0,
    AcademicScore       DECIMAL(5,2)     NOT NULL DEFAULT 0,
    ProjectScore        DECIMAL(5,2)     NOT NULL DEFAULT 0,
    SkillScore          DECIMAL(5,2)     NOT NULL DEFAULT 0,
    ResumeScore         DECIMAL(5,2)     NOT NULL DEFAULT 0,
    CodingProfileScore  DECIMAL(5,2)     NOT NULL DEFAULT 0,
    CertificationScore  DECIMAL(5,2)     NOT NULL DEFAULT 0,
    ReadinessLevel      INT              NOT NULL DEFAULT 1,
    IsLatest            BIT              NOT NULL DEFAULT 1,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_PlacementScores_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- PREDICTIONS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Predictions')
CREATE TABLE Predictions (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    StudentId       UNIQUEIDENTIFIER NOT NULL,
    PredictionScore DECIMAL(5,2)     NOT NULL DEFAULT 0,
    PredictionLevel INT              NOT NULL DEFAULT 1,
    InputSnapshot   NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
    Reasoning       NVARCHAR(2000)   NOT NULL DEFAULT '',
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Predictions_Students FOREIGN KEY (StudentId) REFERENCES Students(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications')
CREATE TABLE Notifications (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    UserId      UNIQUEIDENTIFIER NOT NULL,
    Title       NVARCHAR(200)    NOT NULL,
    Message     NVARCHAR(2000)   NOT NULL,
    Type        INT              NOT NULL DEFAULT 5,
    IsRead      BIT              NOT NULL DEFAULT 0,
    IsEmailSent BIT              NOT NULL DEFAULT 0,
    ActionUrl   NVARCHAR(500)    NULL,
    IsDeleted   BIT              NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
GO

-- =====================================================
-- REPORTS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reports')
CREATE TABLE Reports (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    ReportName          NVARCHAR(200)    NOT NULL,
    ReportType          INT              NOT NULL,
    Format              INT              NOT NULL DEFAULT 1,
    FileUrl             NVARCHAR(500)    NOT NULL DEFAULT '',
    GeneratedByUserId   UNIQUEIDENTIFIER NOT NULL,
    Parameters          NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);
GO

PRINT 'All tables created successfully.';
GO
