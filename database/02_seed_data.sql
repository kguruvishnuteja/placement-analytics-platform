-- =====================================================
-- Seed Data for Placement Analytics Platform
-- =====================================================

USE PlacementAnalyticsDb;
GO

-- Seed Skills
INSERT INTO Skills (Id, Name, Category, Description, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'Java',            'Programming',   'Object-oriented programming language',         GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Python',          'Programming',   'High-level programming language',               GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'C#',              'Programming',   'Microsoft .NET programming language',           GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'JavaScript',      'Programming',   'Web programming language',                      GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'TypeScript',      'Programming',   'Typed JavaScript',                              GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'C++',             'Programming',   'Systems programming language',                  GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'SQL',             'Database',      'Structured Query Language',                     GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'MySQL',           'Database',      'Open-source relational database',               GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'PostgreSQL',      'Database',      'Advanced open-source database',                 GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'MongoDB',         'Database',      'NoSQL document database',                       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'DBMS',            'Database',      'Database Management Systems concepts',          GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'OOP',             'Concepts',      'Object-Oriented Programming principles',        GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Data Structures', 'Concepts',      'Arrays, Trees, Graphs, etc.',                   GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Algorithms',      'Concepts',      'Sorting, searching, dynamic programming',       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Networking',      'Networking',    'Computer networking fundamentals',              GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'REST API',        'Web',           'RESTful API design and development',            GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'REST Security',   'Web',           'API security best practices',                   GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'React',           'Framework',     'JavaScript UI library',                         GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Node.js',         'Framework',     'JavaScript runtime',                            GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'ASP.NET',         'Framework',     'Microsoft web framework',                       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Docker',          'DevOps',        'Container platform',                            GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'AWS',             'Cloud',         'Amazon Web Services',                           GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Azure',           'Cloud',         'Microsoft Azure cloud platform',                GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Communication',   'Soft Skills',   'Professional communication skills',             GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Aptitude',        'Aptitude',      'Logical and mathematical reasoning',            GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Git',             'Tools',         'Version control system',                        GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Linux',           'OS',            'Linux operating system',                        GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Machine Learning','AI/ML',         'ML algorithms and applications',                GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Spring Boot',     'Framework',     'Java Spring Boot framework',                    GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Microservices',   'Architecture',  'Microservices architecture patterns',           GETUTCDATE(), GETUTCDATE());
GO

-- Seed Scoring Rules
INSERT INTO ScoringRules (Id, RuleName, Category, WeightPercent, IsActive, Description, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'Academic Performance', 'Academics',      25.00, 1, 'CGPA, SSC, Intermediate scores',       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Projects',             'Projects',       20.00, 1, 'Number and quality of projects',       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Technical Skills',     'Skills',         20.00, 1, 'Number of verified skills',            GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Resume Quality',       'Resume',         15.00, 1, 'ATS score from resume analysis',       GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Coding Profiles',      'CodingProfiles', 10.00, 1, 'LeetCode, HackerRank, CodeChef activity', GETUTCDATE(), GETUTCDATE()),
    (NEWID(), 'Certifications',       'Certifications', 10.00, 1, 'Professional certifications',          GETUTCDATE(), GETUTCDATE());
GO

-- Seed Admin User (password: Admin@123)
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Role, IsEmailVerified, IsActive, CreatedAt, UpdatedAt)
VALUES (@AdminId, 'admin@placement.edu', '$2a$11$2K3eQj3xZsD1LrxBpnFNNOXU5YKT9sT6kIhN3nPEv8cBLkJ2YKmWG', 'System', 'Admin', 3, 1, 1, GETUTCDATE(), GETUTCDATE());

-- Seed Officer User (password: Officer@123)
DECLARE @OfficerId UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Role, IsEmailVerified, IsActive, CreatedAt, UpdatedAt)
VALUES (@OfficerId, 'officer@placement.edu', '$2a$11$2K3eQj3xZsD1LrxBpnFNNOXU5YKT9sT6kIhN3nPEv8cBLkJ2YKmWG', 'John', 'Officer', 2, 1, 1, GETUTCDATE(), GETUTCDATE());

-- Seed Student User (password: Student@123)
DECLARE @StudentUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @StudentId UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Role, IsEmailVerified, IsActive, CreatedAt, UpdatedAt)
VALUES (@StudentUserId, 'student@placement.edu', '$2a$11$2K3eQj3xZsD1LrxBpnFNNOXU5YKT9sT6kIhN3nPEv8cBLkJ2YKmWG', 'Alice', 'Student', 1, 1, 1, GETUTCDATE(), GETUTCDATE());

INSERT INTO Students (Id, UserId, Phone, Branch, Section, GraduationYear, RollNumber, SscPercentage, IntermediatePercentage, CurrentCgpa, ActiveBacklogs, GitHubProfile, LinkedInProfile, LeetCodeSolved, GitHubRepos, ProfileCompletionPercent, CreatedAt, UpdatedAt)
VALUES (@StudentId, @StudentUserId, '9876543210', 'Computer Science', 'A', 2025, 'CS2021001', 90.00, 88.00, 8.50, 0, 'https://github.com/alice', 'https://linkedin.com/in/alice', 150, 8, 85, GETUTCDATE(), GETUTCDATE());
GO

PRINT 'Seed data inserted successfully.';
GO
