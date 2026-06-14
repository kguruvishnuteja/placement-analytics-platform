# ============================================================
# Placement Analytics Platform — Azure Deploy Script
# Usage: .\azure-deploy.ps1 -Region "southeastasia"
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$Region
)

# ---------- CONFIG ----------
$RESOURCE_GROUP = "placement-rg"
$SQL_SERVER     = "plcmnt-sql-" + (Get-Random -Maximum 9999)   # random suffix = unique
$SQL_DB         = "PlacementAnalyticsDb"
$SQL_ADMIN      = "placementadmin"
$SQL_PASSWORD   = "PlacementAdmin@2024!"
$APP_NAME       = "plcmnt-api-" + (Get-Random -Maximum 9999)   # random suffix = unique
$APP_PLAN       = "plcmnt-plan"
$JWT_KEY        = "PlacementAnalytics_Production_SecretKey_2024!@#Secure"
$FRONTEND_URL   = "https://placement-analytics.vercel.app"
# ----------------------------

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Deploying to Azure region: $Region" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Resource Group
Write-Host "[1/7] Creating Resource Group..." -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP --location $Region
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 1 failed" -ForegroundColor Red; exit 1 }

# 2. SQL Server
Write-Host "`n[2/7] Creating SQL Server: $SQL_SERVER ..." -ForegroundColor Cyan
az sql server create `
    --name $SQL_SERVER `
    --resource-group $RESOURCE_GROUP `
    --location $Region `
    --admin-user $SQL_ADMIN `
    --admin-password $SQL_PASSWORD
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 2 failed" -ForegroundColor Red; exit 1 }

# 3. SQL Firewall
Write-Host "`n[3/7] Opening SQL firewall for Azure services..." -ForegroundColor Cyan
az sql server firewall-rule create `
    --resource-group $RESOURCE_GROUP `
    --server $SQL_SERVER `
    --name AllowAzure `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

# 4. SQL Database
Write-Host "`n[4/7] Creating SQL Database..." -ForegroundColor Cyan
az sql db create `
    --resource-group $RESOURCE_GROUP `
    --server $SQL_SERVER `
    --name $SQL_DB `
    --edition Basic `
    --capacity 5
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 4 failed" -ForegroundColor Red; exit 1 }

# 5. App Service Plan
Write-Host "`n[5/7] Creating App Service Plan (B1 Linux)..." -ForegroundColor Cyan
az appservice plan create `
    --name $APP_PLAN `
    --resource-group $RESOURCE_GROUP `
    --sku B1 `
    --is-linux
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 5 failed" -ForegroundColor Red; exit 1 }

# 6. Web App
Write-Host "`n[6/7] Creating Web App: $APP_NAME ..." -ForegroundColor Cyan
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan $APP_PLAN `
    --name $APP_NAME `
    --runtime "DOTNETCORE:8.0"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 6 failed" -ForegroundColor Red; exit 1 }

# 7. App Settings
Write-Host "`n[7/7] Configuring environment variables..." -ForegroundColor Cyan
$CONN = "Server=tcp:$SQL_SERVER.database.windows.net,1433;Database=$SQL_DB;User Id=$SQL_ADMIN;Password=$SQL_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --settings `
    "ConnectionStrings__DefaultConnection=$CONN" `
    "Jwt__Key=$JWT_KEY" `
    "Jwt__Issuer=PlacementAnalytics" `
    "Jwt__Audience=PlacementAnalyticsUsers" `
    "Frontend__Url=$FRONTEND_URL" `
    "ASPNETCORE_ENVIRONMENT=Production"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Step 7 failed" -ForegroundColor Red; exit 1 }

# Done
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ ALL DONE! Azure resources created." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "🌐 API URL : https://$APP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host "📖 Swagger : https://$APP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host "❤️  Health  : https://$APP_NAME.azurewebsites.net/health" -ForegroundColor Yellow

# Save names to file for reference
"APP_NAME=$APP_NAME`nSQL_SERVER=$SQL_SERVER`nRESOURCE_GROUP=$RESOURCE_GROUP`nREGION=$Region" `
    | Out-File -FilePath "$PSScriptRoot\azure-names.txt"
Write-Host "`nResource names saved to: docs\azure-names.txt" -ForegroundColor Gray

# Get publish profile
Write-Host "`nGetting GitHub Actions publish profile..." -ForegroundColor Cyan
az webapp deployment list-publishing-profiles `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --xml `
    --output tsv > "$PSScriptRoot\publish_profile.xml"
Write-Host "✅ Saved to: docs\publish_profile.xml" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor White
Write-Host "NOW DO THESE 4 STEPS:" -ForegroundColor White
Write-Host "============================================" -ForegroundColor White
Write-Host "1. Open docs\publish_profile.xml, COPY ALL contents" -ForegroundColor White
Write-Host "2. Go to GitHub → Settings → Secrets → Actions" -ForegroundColor White
Write-Host "   URL: https://github.com/kguruvishnuteja/placement-analytics-platform/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "3. Add secret: AZURE_WEBAPP_PUBLISH_PROFILE = (paste xml)" -ForegroundColor White
Write-Host "4. Add secret: VITE_API_URL = https://$APP_NAME.azurewebsites.net/api" -ForegroundColor White
Write-Host "`nThen push to GitHub to trigger auto-deploy:" -ForegroundColor White
Write-Host "   cd C:\Users\Satya\Project\PlacementAnalyticsPlatform" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'deploy: trigger azure deployment'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host "`n⚠️  DELETE publish_profile.xml after adding to GitHub!" -ForegroundColor Red
