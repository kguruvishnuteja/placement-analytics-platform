# 🎓 Placement Analytics & Career Readiness Platform

> A production-ready full-stack web application that helps students assess placement readiness, identify skill gaps, analyze resumes, and track progress toward eligibility for target companies.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoftsqlserver)](https://microsoft.com/sql-server)

---

## 📸 Screenshots

| Student Dashboard | Resume Analyzer | Skill Gap |
|---|---|---|
| Readiness score, ATS, eligible companies | ATS scoring with suggestions | Company-wise skill comparison |

---

## ✨ Features

### 👨‍🎓 Students
- **Placement Readiness Score** — Weighted scoring across academics (25%), projects (20%), skills (20%), resume (15%), coding profiles (10%), certifications (10%)
- **Resume Analyzer** — Upload PDF/DOC → ATS score 0–100 with section breakdown + improvement suggestions
- **Company Eligibility Engine** — Auto-evaluates CGPA, backlogs, branch, and skill requirements for every company
- **Skill Gap Analysis** — Visual comparison with learning path recommendations and resource links
- **Placement Prediction** — ML-style probability engine (High / Moderate / Low Chance) with history tracking
- **Profile Management** — Skills, projects, certifications, internships, and coding profiles (LeetCode, GitHub, etc.)

### 👔 Placement Officers
- **Student Analytics** — Branch-wise breakdown, CGPA distribution, readiness heatmap
- **Company Management** — Add companies with eligibility criteria and required skills
- **Recruitment Drives** — Schedule and track placement drives
- **Reports** — Student readiness and eligibility reports

### 🔑 Admins
- **User Management** — Full CRUD for all roles
- **Scoring Rule Config** — Adjust readiness score weights in real time
- **System Dashboard** — Platform-wide analytics and health

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18 + TypeScript + Tailwind CSS |
| State        | Zustand + TanStack Query            |
| Charts       | Recharts                            |
| Backend      | ASP.NET Core 8 Web API              |
| ORM          | Entity Framework Core 8             |
| Database     | Microsoft SQL Server 2022           |
| Auth         | JWT + Refresh Tokens + BCrypt       |
| Docs         | Swagger / OpenAPI                   |
| Frontend Host | Vercel                             |
| Backend Host | Azure App Service                   |
| DB Host      | Azure SQL Database                  |

---

## 🏗️ Architecture — Clean Architecture

```
┌─────────────────────────────────────────────┐
│               React Frontend                │
│  (Vite · React Query · Zustand · Recharts)  │
└────────────────────┬────────────────────────┘
                     │ REST / JSON
┌────────────────────▼────────────────────────┐
│          ASP.NET Core 8 API Layer           │
│     (Controllers · Middleware · Swagger)    │
├─────────────────────────────────────────────┤
│            Application Layer               │
│  (Services · DTOs · Interfaces · Validators)│
├─────────────────────────────────────────────┤
│              Domain Layer                   │
│         (Entities · Enums · Base)           │
├─────────────────────────────────────────────┤
│           Infrastructure Layer             │
│  (EF Core · Repository · UoW · DbSeeder)    │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│         Microsoft SQL Server                │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [.NET 8 SDK](https://dot.net/download)
- [Node.js 20+](https://nodejs.org)
- SQL Server (LocalDB or full)

### 1. Clone

```bash
git clone https://github.com/yourusername/placement-analytics-platform.git
cd placement-analytics-platform
```

### 2. Backend

```bash
cd backend
dotnet restore

# Run EF migrations (creates + seeds DB automatically)
dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API

# Start API
cd PlacementAnalytics.API
dotnet run
# → http://localhost:5000  (Swagger UI at root)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm install --legacy-peer-deps
npm run dev
# → http://localhost:5173
```

### 4. Login with demo accounts

| Role              | Email                      | Password    |
|-------------------|----------------------------|-------------|
| Student           | student@placement.edu      | Student@123 |
| Placement Officer | officer@placement.edu      | Officer@123 |
| Admin             | admin@placement.edu        | Admin@123   |

---

## 🐳 Docker

```bash
cd docker
docker compose up --build

# Frontend → http://localhost
# API      → http://localhost:5000
# Swagger  → http://localhost:5000
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Endpoint                         | Method | Auth   | Description                    |
|----------------------------------|--------|--------|--------------------------------|
| `/auth/register`                 | POST   | None   | Register new user              |
| `/auth/login`                    | POST   | None   | Login → JWT tokens             |
| `/auth/refresh-token`            | POST   | None   | Refresh access token           |
| `/auth/forgot-password`          | POST   | None   | Send reset email               |
| `/auth/reset-password`           | POST   | None   | Reset with token               |
| `/student/profile`               | GET    | Student| Get own profile                |
| `/student/profile`               | PUT    | Student| Update profile                 |
| `/student/skills`                | POST   | Student| Add skill                      |
| `/student/projects`              | POST   | Student| Add project                    |
| `/student/certifications`        | POST   | Student| Add certification              |
| `/resume/upload`                 | POST   | Student| Upload + analyze resume        |
| `/resume/latest`                 | GET    | Student| Get latest analysis            |
| `/company`                       | GET    | Any    | List companies                 |
| `/company`                       | POST   | Officer| Create company                 |
| `/company/{id}/eligibility`      | GET    | Student| Check eligibility              |
| `/company/{id}/skill-gap`        | GET    | Student| Get skill gap analysis         |
| `/company/eligible`              | GET    | Student| All eligible companies         |
| `/analytics/readiness-score`     | GET    | Student| Calculate readiness score      |
| `/analytics/prediction`          | GET    | Student| Get placement prediction       |
| `/analytics/student-dashboard`   | GET    | Student| Dashboard data                 |
| `/analytics/officer-dashboard`   | GET    | Officer| Officer analytics              |
| `/analytics/admin-dashboard`     | GET    | Admin  | Admin stats                    |
| `/analytics/scoring-rules`       | GET    | Admin  | Get scoring config             |
| `/analytics/scoring-rules/{id}`  | PUT    | Admin  | Update scoring weight          |
| `/skills`                        | GET    | None   | List all skills                |
| `/notifications`                 | GET    | Auth   | Get notifications              |

Full Swagger docs available at `http://localhost:5000` when running.

---

## 🗄️ Database Schema

```
Users ──────────── Students
                      ├── StudentSkills ──── Skills ◄── CompanySkills ── Companies
                      ├── Projects                                            ├── RecruitmentDrives
                      ├── Certifications                                      └── StudentEligibilities
                      ├── Internships
                      ├── ResumeAnalyses
                      ├── PlacementScores
                      └── Predictions

ScoringRules
Notifications
Reports
```

---

## 📈 Scoring Formula

```
Readiness Score = (Academic × 25%) + (Projects × 20%) + (Skills × 20%)
                + (Resume × 15%) + (Coding × 10%) + (Certifications × 10%)

Score Range:
  0–40   → Beginner
  41–60  → Improving
  61–80  → Placement Ready
  81–100 → Highly Competitive
```

Weights are configurable from the Admin → Scoring Rules panel.

---

## 🌐 Deployment

- **Frontend → Vercel**: See [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md)
- **Backend → Azure App Service**: See [`docs/AZURE_DEPLOYMENT.md`](docs/AZURE_DEPLOYMENT.md)
- **Local → Docker**: `cd docker && docker compose up --build`

---

## 📁 Project Structure

```
PlacementAnalyticsPlatform/
├── backend/
│   ├── PlacementAnalytics.API/           # Entry point, controllers, middleware
│   ├── PlacementAnalytics.Application/   # Business logic, services, DTOs
│   ├── PlacementAnalytics.Domain/        # Core entities, enums
│   ├── PlacementAnalytics.Infrastructure/# Data layer, EF Core, repositories
│   └── PlacementAnalytics.sln
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios clients per domain
│   │   ├── components/   # UI components + layout
│   │   ├── pages/        # Student, Officer, Admin pages
│   │   ├── store/        # Zustand (auth, theme)
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Utility functions
│   ├── tailwind.config.js
│   └── vite.config.ts
├── database/
│   ├── 01_create_tables.sql
│   └── 02_seed_data.sql
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   └── nginx.conf
└── docs/
    ├── AZURE_DEPLOYMENT.md
    ├── VERCEL_DEPLOYMENT.md
    └── LOCAL_SETUP.md
```

---

## 🔒 Security

- Passwords hashed with BCrypt (cost factor 11)
- JWT access tokens (1-hour expiry) + refresh tokens (7-day)
- Role-based authorization (`[Authorize(Roles = "...")]`)
- Global exception middleware — no stack traces leaked to clients
- Soft delete pattern — data retained for audit trails
- Input validation on all endpoints
- CORS configured to allowed origins only

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built With

- Clean Architecture principles
- Repository + Unit of Work patterns
- Service layer with dependency injection
- JWT + Refresh Token auth flow
- React Query for server state
- Zustand for client state
- Responsive design with dark mode
