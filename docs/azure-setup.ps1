# ============================================================
# Placement Analytics Platform — Azure Setup Script
# Run this in PowerShell after: az login
# ============================================================

# ---------- CHANGE THESE VALUES IF NEEDED ----------
$RESOURCE_GROUP    = "placement-rg"
$LOCATION          = "centralindia"                      # Changed — works for free accounts in India
$SQL_SERVER        = "placement-sql-srv-2024"            # Globally unique name
$SQL_DB            = "PlacementAnalyticsDb"
$SQL_ADMIN         = "placementadmin"
$SQL_PASSWORD      = "PlacementAdmin@2024!"
$APP_NAME          = "placement-analytics-api-2024"      # Globally unique name
$APP_PLAN          = "placement-api-plan"
$JWT_KEY           = "PlacementAnalytics_SuperSecretKey_2024_Production!@#"
$FRONTEND_URL      = "https://placement-analytics.vercel.app"
# ---------------------------------------------------

# ── Step 0: Delete old failed resource group if exists ──────────────────────
Write-Host "`n[0/7] Cleaning up old failed resources..." -ForegroundColor Magenta
az group delete --name $RESOURCE_GROUP --yes --no-wait 2>$null
Write-Host "Waiting 15 seconds for cleanup..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# ── Step 1: Resource Group ───────────────────────────────────────────────────
Write-Host "`n[1/7] Creating Resource Group in '$LOCATION'..." -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP --location $LOCATION
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 1" -ForegroundColor Red; exit 1 }
Write-Host "✅ Resource group created" -ForegroundColor Green

# ── Step 2: SQL Server ───────────────────────────────────────────────────────
Write-Host "`n[2/7] Creating SQL Server '$SQL_SERVER'..." -ForegroundColor Cyan
az sql server create `
  --name $SQL_SERVER `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --admin-user $SQL_ADMIN `
  --admin-password $SQL_PASSWORD
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 2 — try changing `$SQL_SERVER to a different unique name" -ForegroundColor Red; exit 1 }
Write-Host "✅ SQL Server created" -ForegroundColor Green

# ── Step 3: Firewall Rule ─────────────────────────────────────────────────────
Write-Host "`n[3/7] Allowing Azure services to access SQL..." -ForegroundColor Cyan
az sql server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --server $SQL_SERVER `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
Write-Host "✅ Firewall rule set" -ForegroundColor Green

# ── Step 4: SQL Database ──────────────────────────────────────────────────────
Write-Host "`n[4/7] Creating SQL Database '$SQL_DB'..." -ForegroundColor Cyan
az sql db create `
  --resource-group $RESOURCE_GROUP `
  --server $SQL_SERVER `
  --name $SQL_DB `
  --edition Basic `
  --capacity 5
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 4" -ForegroundColor Red; exit 1 }
Write-Host "✅ SQL Database created" -ForegroundColor Green

# ── Step 5: App Service Plan ──────────────────────────────────────────────────
Write-Host "`n[5/7] Creating App Service Plan (Linux B1)..." -ForegroundColor Cyan
az appservice plan create `
  --name $APP_PLAN `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux `
  --location $LOCATION
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 5" -ForegroundColor Red; exit 1 }
Write-Host "✅ App Service Plan created" -ForegroundColor Green

# ── Step 6: Web App ───────────────────────────────────────────────────────────
Write-Host "`n[6/7] Creating Web App '$APP_NAME' (.NET 8)..." -ForegroundColor Cyan
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_PLAN `
  --name $APP_NAME `
  --runtime "DOTNETCORE:8.0"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 6 — try changing `$APP_NAME to a different unique name" -ForegroundColor Red; exit 1 }
Write-Host "✅ Web App created" -ForegroundColor Green

# ── Step 7: Configure App Settings ────────────────────────────────────────────
Write-Host "`n[7/7] Configuring environment variables on Azure..." -ForegroundColor Cyan
$CONNECTION_STRING = "Server=tcp:$SQL_SERVER.database.windows.net,1433;Database=$SQL_DB;User Id=$SQL_ADMIN;Password=$SQL_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --settings `
  "ConnectionStrings__DefaultConnection=$CONNECTION_STRING" `
  "Jwt__Key=$JWT_KEY" `
  "Jwt__Issuer=PlacementAnalytics" `
  "Jwt__Audience=PlacementAnalyticsUsers" `
  "Frontend__Url=$FRONTEND_URL" `
  "ASPNETCORE_ENVIRONMENT=Production"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Failed at Step 7" -ForegroundColor Red; exit 1 }
Write-Host "✅ App settings configured" -ForegroundColor Green

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ AZURE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "🌐 App URL  : https://$APP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host "📖 Swagger  : https://$APP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host "❤️  Health   : https://$APP_NAME.azurewebsites.net/health" -ForegroundColor Yellow

# ── Get Publish Profile for GitHub Actions ────────────────────────────────────
Write-Host "`nSaving publish profile for GitHub Actions..." -ForegroundColor Cyan
az webapp deployment list-publishing-profiles `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --xml `
  --output tsv > "$PSScriptRoot\publish_profile.xml"

Write-Host "✅ Saved: docs\publish_profile.xml" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor White
Write-Host "1. Open docs\publish_profile.xml, copy ALL contents" -ForegroundColor White
Write-Host "2. Go to: https://github.com/kguruvishnuteja/placement-analytics-platform/settings/secrets/actions" -ForegroundColor White
Write-Host "3. Add secret: AZURE_WEBAPP_PUBLISH_PROFILE = (paste the xml)" -ForegroundColor White
Write-Host "4. Add secret: VITE_API_URL = https://$APP_NAME.azurewebsites.net/api" -ForegroundColor White
Write-Host "5. Run: git push origin main   (triggers auto deploy)" -ForegroundColor White
Write-Host "6. Delete publish_profile.xml after adding to GitHub!" -ForegroundColor Red
