# Azure Deployment Guide — Placement Analytics Platform

## Overview

```
GitHub Actions → Azure App Service (API)  ↔  Azure SQL Database
                        ↑
               Vercel (Frontend) → API calls
```

---

## Prerequisites

```bash
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login
az login

# Set subscription (if you have multiple)
az account set --subscription "<your-subscription-id>"
```

---

## Step 1 — Resource Group

```bash
az group create \
  --name placement-rg \
  --location eastus
```

---

## Step 2 — Azure SQL Database

```bash
# Create SQL Server
az sql server create \
  --name placement-sql-server \
  --resource-group placement-rg \
  --location eastus \
  --admin-user placementadmin \
  --admin-password "PlacementAdmin@2024!"

# Allow Azure services (App Service → SQL)
az sql server firewall-rule create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your local IP for running migrations
az sql server firewall-rule create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name DevIP \
  --start-ip-address $(curl -s https://api.ipify.org) \
  --end-ip-address $(curl -s https://api.ipify.org)

# Create the database (Basic = ~$5/mo)
az sql db create \
  --resource-group placement-rg \
  --server placement-sql-server \
  --name PlacementAnalyticsDb \
  --edition Basic \
  --capacity 5
```

### Get the connection string

```bash
az sql db show-connection-string \
  --server placement-sql-server \
  --name PlacementAnalyticsDb \
  --client ado.net
```

It will look like:
```
Server=tcp:placement-sql-server.database.windows.net,1433;
Database=PlacementAnalyticsDb;
User Id=placementadmin;
Password=PlacementAdmin@2024!;
Encrypt=True;TrustServerCertificate=False;
Connection Timeout=30;
```

---

## Step 3 — Azure App Service

```bash
# Create App Service Plan (B1 = ~$13/mo, supports .NET 8)
az appservice plan create \
  --name placement-api-plan \
  --resource-group placement-rg \
  --sku B1 \
  --is-linux

# Create Web App (Linux + .NET 8)
az webapp create \
  --resource-group placement-rg \
  --plan placement-api-plan \
  --name placement-analytics-api \
  --runtime "DOTNETCORE:8.0" \
  --deployment-local-git
```

### Configure App Settings (replaces appsettings.Production.json tokens)

```bash
az webapp config appsettings set \
  --resource-group placement-rg \
  --name placement-analytics-api \
  --settings \
  "ConnectionStrings__DefaultConnection=Server=tcp:placement-sql-server.database.windows.net,1433;Database=PlacementAnalyticsDb;User Id=placementadmin;Password=PlacementAdmin@2024!;Encrypt=True;TrustServerCertificate=False;" \
  "Jwt__Key=PlacementAnalyticsSecretKeyForProduction2024SuperSecure!@#$%^" \
  "Jwt__Issuer=PlacementAnalytics" \
  "Jwt__Audience=PlacementAnalyticsUsers" \
  "Frontend__Url=https://placement-analytics.vercel.app" \
  "ASPNETCORE_ENVIRONMENT=Production"
```

### Enable logging (important for troubleshooting)

```bash
az webapp log config \
  --resource-group placement-rg \
  --name placement-analytics-api \
  --application-logging filesystem \
  --level information

# Stream live logs
az webapp log tail \
  --resource-group placement-rg \
  --name placement-analytics-api
```

---

## Step 4 — GitHub Actions Setup

### Get the publish profile

```bash
az webapp deployment list-publishing-profiles \
  --resource-group placement-rg \
  --name placement-analytics-api \
  --xml \
  --output tsv > publish_profile.xml
```

### Add secrets to GitHub

Go to: `https://github.com/kguruvishnuteja/placement-analytics-platform/settings/secrets/actions`

Add these secrets:

| Secret Name                       | Value                              |
|-----------------------------------|------------------------------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE`    | Contents of `publish_profile.xml`  |
| `VITE_API_URL`                    | `https://placement-analytics-api.azurewebsites.net/api` |
| `VERCEL_TOKEN`                    | From vercel.com/account/tokens     |
| `VERCEL_ORG_ID`                   | From `.vercel/project.json`        |
| `VERCEL_PROJECT_ID`               | From `.vercel/project.json`        |

Delete `publish_profile.xml` after adding to GitHub secrets:
```bash
rm publish_profile.xml
```

---

## Step 5 — Database Migration

Since the app auto-seeds on startup, you just need to run the EF migrations once:

```bash
cd backend

# Install EF tools
dotnet tool install --global dotnet-ef

# Run migrations (creates all tables + seeds demo data)
dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API \
  --connection "Server=tcp:placement-sql-server.database.windows.net,1433;Database=PlacementAnalyticsDb;User Id=placementadmin;Password=PlacementAdmin@2024!;Encrypt=True;"
```

**Or use the raw SQL scripts** (no .NET SDK needed):
```
database/01_create_tables.sql  → Run in Azure Query Editor
database/02_seed_data.sql      → Run in Azure Query Editor
```

---

## Step 6 — Deploy

### Via GitHub Actions (automatic on push to main)

```bash
git add .
git commit -m "deploy: ready for Azure"
git push origin main
```

The workflow at `.github/workflows/deploy-api.yml` handles the rest.

### Via Azure CLI (manual fallback)

```bash
cd backend
dotnet publish PlacementAnalytics.API/PlacementAnalytics.API.csproj \
  -c Release -o ./publish /p:UseAppHost=false
cd publish && zip -r ../api.zip . && cd ..
az webapp deploy \
  --resource-group placement-rg \
  --name placement-analytics-api \
  --src-path api.zip \
  --type zip
```

---

## Step 7 — Verify Deployment

```bash
# Health check
curl https://placement-analytics-api.azurewebsites.net/health

# Swagger UI
open https://placement-analytics-api.azurewebsites.net

# Test login API
curl -X POST https://placement-analytics-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@placement.edu","password":"Admin@123"}'
```

---

## Troubleshooting Common Azure Failures

### ❌ "Cannot open server" (SQL)
→ Add your App Service outbound IPs to SQL firewall:
```bash
az webapp show --name placement-analytics-api --resource-group placement-rg \
  --query outboundIpAddresses -o tsv
```
Add each IP with `az sql server firewall-rule create`.

### ❌ App starts but returns 500
→ Check logs: `az webapp log tail --name placement-analytics-api --resource-group placement-rg`

### ❌ CORS errors in browser
→ Verify `Frontend__Url` app setting matches exact Vercel URL (no trailing slash).

### ❌ JWT errors
→ Ensure `Jwt__Key` is at least 32 characters and matches frontend `.env`.

### ❌ EF migration fails
→ Run SQL scripts manually via Azure Portal → SQL Database → Query Editor.

---

## Cost Summary

| Resource              | Tier  | Est. Monthly |
|-----------------------|-------|--------------|
| Azure App Service     | B1    | ~$13         |
| Azure SQL Database    | Basic | ~$5          |
| Azure Blob (optional) | LRS   | <$1          |
| **Total**             |       | **~$18/mo**  |

> Use **F1 (Free)** App Service tier for development (60 CPU min/day limit).
