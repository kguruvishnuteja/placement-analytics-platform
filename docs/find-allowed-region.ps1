# ============================================================
# Step 1: Find which regions are allowed for your account
# Run this FIRST to find a working region
# ============================================================

Write-Host "Finding allowed regions for your Azure account..." -ForegroundColor Cyan
Write-Host "This may take 1-2 minutes...`n" -ForegroundColor Gray

# Clean up old failed resource group
Write-Host "Cleaning up old resource group..." -ForegroundColor Yellow
az group delete --name "placement-rg" --yes --no-wait 2>$null
Start-Sleep -Seconds 5

# Regions to try (ordered by likelihood for free/student accounts)
$regions = @(
    "southeastasia",
    "westeurope", 
    "northeurope",
    "australiaeast",
    "brazilsouth",
    "japaneast",
    "koreacentral",
    "southindia",
    "centralindia",
    "westindia",
    "eastasia",
    "uksouth",
    "canadacentral",
    "francecentral",
    "germanywestcentral"
)

$workingRegion = $null

foreach ($region in $regions) {
    Write-Host "Testing region: $region ..." -ForegroundColor Gray -NoNewline
    
    # Try creating a test resource group
    $result = az group create --name "test-placement-rg" --location $region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        # Try creating a minimal app service plan to really test
        $testResult = az appservice plan create `
            --name "test-plan-temp" `
            --resource-group "test-placement-rg" `
            --sku F1 `
            --is-linux `
            --location $region 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ ALLOWED!" -ForegroundColor Green
            $workingRegion = $region
            # Cleanup test resources
            az group delete --name "test-placement-rg" --yes --no-wait 2>$null
            break
        } else {
            Write-Host " ❌ Blocked" -ForegroundColor Red
            az group delete --name "test-placement-rg" --yes --no-wait 2>$null
        }
    } else {
        Write-Host " ❌ Blocked" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

if ($workingRegion) {
    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host "✅ Found working region: $workingRegion" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "`nNow run the main setup with this region:" -ForegroundColor Yellow
    Write-Host "  cd C:\Users\Satya\Project\PlacementAnalyticsPlatform\docs" -ForegroundColor White
    Write-Host "  .\azure-deploy.ps1 -Region $workingRegion" -ForegroundColor White
    
    # Save the working region to a file
    $workingRegion | Out-File -FilePath "$PSScriptRoot\working-region.txt"
    Write-Host "`nSaved to: docs\working-region.txt" -ForegroundColor Gray
} else {
    Write-Host "`n============================================" -ForegroundColor Red
    Write-Host "❌ No region allowed on this account" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "`nYour Azure account type does not support App Services." -ForegroundColor Yellow
    Write-Host "See docs\ALTERNATIVE_DEPLOY.md for free alternatives." -ForegroundColor Yellow
}
