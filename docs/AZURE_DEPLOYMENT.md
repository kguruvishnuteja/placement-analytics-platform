# Azure Deployment Guide — Placement Analytics Platform

## Architecture

```
Azure SQL Database  ←→  Azure App Service (API)  ←→  Vercel (Frontend)
                              ↑
                    Azure Blob Storage (Resumes)
```

---

## Step 1 — Azure SQL Database

### Create the database

```bash
# Login
az login

# Create resource group
az group create --name placement-rg --location eastus

# Create SQL Server
az sql server create \
  --name placement-sql-server \
  --resource-group placement-rg \
  --location eastus \
  --admin-user placementadmin \
  --admin-password "PlacementAdmin@2024!"

# Create database (Basic tier — ~5$/month)
az sql db create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name PlacementAnalyticsDb \
  --edition Basic \
  --capacity 5

# Allow Azure services to connect
az sql server firewall-rule create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (for EF migrations)
az sql server firewall-rule create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name MyDevIP \
  --start-ip-address <YOUR_IP> \
  --end-ip-address <YOUR_IP>
```

### Connection string format

```
Server=tcp:placement-sql-server.database.windows.net,1433;
Database=PlacementAnalyticsDb;
User Id=placementadmin;
Password=PlacementAdmin@2024!;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

### Run EF Core migrations

```bash
cd backend
dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API \
  --connection "Server=tcp:placement-sql-server.database.windows.net,1433;..."
```

---

## Step 2 — Azure App Service (Backend API)

### Create App Service

```bash
# Create App Service Plan (Free tier to start)
az appservice plan create \
  --name placement-api-plan \
  --resource-group placement-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group placement-rg \
  --plan placement-api-plan \
  --name placement-api \
  --runtime "DOTNETCORE:8.0"
```

### Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group placement-rg \
  --name placement-api \
  --settings \
    "ConnectionStrings__DefaultConnection=Server=tcp:placement-sql-server.database.windows.net,1433;Database=PlacementAnalyticsDb;User Id=placementadmin;Password=PlacementAdmin@2024!;Encrypt=True;" \
    "Jwt__Key=REPLACE_WITH_LONG_RANDOM_SECRET_MIN_32_CHARS" \
    "Jwt__Issuer=PlacementAnalytics" \
    "Jwt__Audience=PlacementAnalyticsUsers" \
    "Frontend__Url=https://placement-analytics.vercel.app" \
    "ASPNETCORE_ENVIRONMENT=Production"
```

### Deploy via GitHub Actions (recommended)

Create `.github/workflows/deploy-api.yml`:

```yaml
name: Deploy API to Azure

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET 8
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore & Build
        run: |
          cd backend
          dotnet restore
          dotnet publish PlacementAnalytics.API/PlacementAnalytics.API.csproj \
            -c Release -o ./publish

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: placement-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: backend/publish
```

### Deploy via ZIP (manual)

```bash
cd backend
dotnet publish PlacementAnalytics.API/PlacementAnalytics.API.csproj -c Release -o ./publish
cd publish && zip -r ../api.zip .
az webapp deploy --resource-group placement-rg --name placement-api --src-path ../api.zip
```

---

## Step 3 — Azure Blob Storage (Resume Uploads)

```bash
# Create storage account
az storage account create \
  --name placementstorage \
  --resource-group placement-rg \
  --location eastus \
  --sku Standard_LRS

# Create container
az storage container create \
  --account-name placementstorage \
  --name resumes \
  --public-access off

# Get connection string
az storage account show-connection-string \
  --name placementstorage \
  --resource-group placement-rg
```

Add to App Service settings:
```
AzureStorage__ConnectionString=<connection-string>
AzureStorage__ContainerName=resumes
```

---

## Step 4 — CORS Configuration

In App Service → CORS, add allowed origins:
- `https://placement-analytics.vercel.app`
- `http://localhost:5173` (dev)

---

## Cost Estimate (Monthly)

| Service             | Tier    | Est. Cost  |
|---------------------|---------|------------|
| Azure SQL Database  | Basic   | ~$5        |
| Azure App Service   | B1      | ~$13       |
| Azure Blob Storage  | LRS     | <$1        |
| **Total**           |         | **~$19/mo** |

> Use Free Tier (F1) for App Service during development — 60 CPU min/day limit.

---

## Health Check URL

After deployment:
```
https://placement-api.azurewebsites.net/index.html  ← Swagger UI
https://placement-api.azurewebsites.net/api/skills   ← API test
```
