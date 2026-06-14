# Alternative Deployment (if Azure is blocked)

Your Azure free/student account blocks resource creation in all regions.
Here are 3 free alternatives that work immediately.

---

## Option 1 — Railway (EASIEST — Free, no credit card)

Railway hosts .NET APIs + SQL Server databases for free.

### Deploy Backend to Railway

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub (kguruvishnuteja)
4. Click "Deploy from GitHub repo"
5. Select: placement-analytics-platform
6. Set Root Directory: `backend`
7. Set Start Command: `dotnet PlacementAnalytics.API.dll`

### Add SQL Server database on Railway

1. In your Railway project, click "+ New"
2. Select "Database" → "Add Microsoft SQL Server"
3. Railway gives you a connection string automatically
4. Copy the connection string
5. In your API service → Variables → Add:
   - `ConnectionStrings__DefaultConnection` = (paste connection string)
   - `Jwt__Key` = PlacementAnalytics_SuperSecretKey_2024
   - `Jwt__Issuer` = PlacementAnalytics
   - `Jwt__Audience` = PlacementAnalyticsUsers
   - `Frontend__Url` = https://placement-analytics.vercel.app
   - `ASPNETCORE_ENVIRONMENT` = Production

Railway auto-deploys on every push to main.

---

## Option 2 — Render (Free tier, no credit card)

### Deploy Backend

1. Go to: https://render.com
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect repo: placement-analytics-platform
5. Settings:
   - Root Directory: `backend`
   - Runtime: Docker
   - Dockerfile: `../docker/Dockerfile.api`
6. Add environment variables (same as Railway above)

### Add Database

1. Render → "New" → "PostgreSQL" (free)
   Note: Render doesn't offer SQL Server free.
   The app can be adapted to use PostgreSQL by changing:
   `UseSqlServer(...)` → `UseNpgsql(...)` in Program.cs

---

## Option 3 — Fly.io (Free, works globally)

```powershell
# Install flyctl
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
flyctl auth login

# Deploy
cd "C:\Users\Satya\Project\PlacementAnalyticsPlatform\backend"
flyctl launch
flyctl deploy
```

---

## Option 4 — Use Azure with a Personal Account

Your Vignan University account is restricted. Create a personal account:

1. Go to: https://azure.microsoft.com/free
2. Use a personal email (Gmail, Outlook, etc.)
3. Add a credit card (won't be charged — $200 free credits)
4. Then run: `az logout` → `az login` with the new account
5. Run: `.\find-allowed-region.ps1` to find a working region
6. Run: `.\azure-deploy.ps1 -Region <found-region>`

---

## Recommended path for portfolio

| Platform  | Cost  | Setup Time | Best For          |
|-----------|-------|------------|-------------------|
| Railway   | Free  | 5 min      | Quick demo        |
| Vercel    | Free  | 2 min      | Frontend only     |
| Azure     | ~$18/mo | 15 min  | Production/resume |
| Render    | Free  | 10 min     | Portfolio         |

For a **resume/portfolio project**, deploy:
- Frontend → Vercel (free, fast, easy)
- Backend → Railway (free, supports .NET)
- Database → Railway PostgreSQL or SQL Server

This gives you live URLs to put on your resume with zero cost.
