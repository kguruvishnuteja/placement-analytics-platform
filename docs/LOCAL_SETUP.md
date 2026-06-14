# Local Development Setup

## Prerequisites

| Tool          | Version  | Download                          |
|---------------|----------|-----------------------------------|
| .NET SDK      | 8.0+     | https://dot.net/download          |
| Node.js       | 20+      | https://nodejs.org                |
| SQL Server    | 2019+    | https://aka.ms/sql-developer-edition |
| Git           | Latest   | https://git-scm.com               |

---

## 1. Clone & Setup

```bash
git clone https://github.com/yourusername/placement-analytics-platform.git
cd placement-analytics-platform
```

---

## 2. Backend Setup

```bash
cd backend

# Restore packages
dotnet restore

# Copy and configure environment
cp PlacementAnalytics.API/.env.example PlacementAnalytics.API/appsettings.Development.json
# Edit the connection string to your local SQL Server
```

### Run EF Core Migrations

```bash
# Install EF Core tools (once)
dotnet tool install --global dotnet-ef

# Create/update database
dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API

# Database will be auto-seeded with demo data on first run
```

### Start the API

```bash
cd PlacementAnalytics.API
dotnet run
# API runs at: http://localhost:5000
# Swagger UI:  http://localhost:5000 (root)
```

---

## 3. Frontend Setup

```bash
cd frontend

# Copy env file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already set)

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev
# Frontend runs at: http://localhost:5173
```

---

## 4. Demo Accounts

| Role              | Email                      | Password     |
|-------------------|----------------------------|--------------|
| Student           | student@placement.edu      | Student@123  |
| Placement Officer | officer@placement.edu      | Officer@123  |
| Admin             | admin@placement.edu        | Admin@123    |

---

## 5. Docker (All-in-One)

```bash
cd docker
docker compose up --build

# Services:
#   Frontend:  http://localhost
#   API:       http://localhost:5000
#   Swagger:   http://localhost:5000
#   SQL Server: localhost:1433
```

---

## 6. Useful Commands

```bash
# Backend
dotnet ef migrations add <MigrationName> \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API

dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API

# Frontend
npm run build          # Production build
npm run lint           # ESLint check
npx tsc --noEmit       # TypeScript type check
```

---

## 7. Project Structure

```
PlacementAnalyticsPlatform/
├── backend/
│   ├── PlacementAnalytics.API/           # Controllers, Middleware, Program.cs
│   ├── PlacementAnalytics.Application/   # Services, DTOs, Interfaces
│   ├── PlacementAnalytics.Domain/        # Entities, Enums
│   ├── PlacementAnalytics.Infrastructure/# DbContext, Repositories, Seeder
│   └── PlacementAnalytics.sln
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios API clients
│   │   ├── components/   # Reusable UI + Layout components
│   │   ├── pages/        # Student / Officer / Admin pages
│   │   ├── store/        # Zustand state (auth, theme)
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Helpers, cn()
│   └── package.json
│
├── database/
│   ├── 01_create_tables.sql
│   └── 02_seed_data.sql
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── Dockerfile.frontend
│
└── docs/
    ├── AZURE_DEPLOYMENT.md
    ├── VERCEL_DEPLOYMENT.md
    └── LOCAL_SETUP.md
```
