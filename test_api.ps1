# Script de test de l'API Pac-Man Maze Generator (PowerShell)
# Usage: .\test_api.ps1 [-ApiUrl "http://localhost:5000"]

param(
    [string]$ApiUrl = "http://localhost:5000"
)

Write-Host "Testing API at: $ApiUrl" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

$Passed = 0
$Failed = 0

# Test 1: Health check
Write-Host "`nTest 1: Health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ PASS: API is reachable (HTTP $($response.StatusCode))" -ForegroundColor Green
        $Passed++
    }
} catch {
    Write-Host "✗ FAIL: API not reachable - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Test 2: Get default maze
Write-Host "`nTest 2: Get default maze..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/maze" -Method GET
    if ($response.metadata -and $response.cells) {
        Write-Host "✓ PASS: Received valid JSON with metadata and cells" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "✗ FAIL: Invalid response structure" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "✗ FAIL: Request failed - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Test 3: Generate 30x30 maze
Write-Host "`nTest 3: Generate 30x30 maze..." -ForegroundColor Yellow
$body = @{
    width = 30
    height = 30
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    if ($response.width -eq 30 -and $response.height -eq 30) {
        Write-Host "✓ PASS: Dimensions are correct (30x30)" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "✗ FAIL: Expected 30x30, got $($response.width)x$($response.height)" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "✗ FAIL: Request failed - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Test 4: Generate maze with custom parameters
Write-Host "`nTest 4: Generate maze with custom parameters..." -ForegroundColor Yellow
$body = @{
    width = 15
    height = 15
    playability = 0.7
    dead_end_ratio = 0.0
    cycle_intensity = 0.8
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "✓ PASS: Maze generated with custom parameters" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "✗ FAIL: Failed to generate maze" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "✗ FAIL: Request failed - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Test 5: Invalid dimensions (should fail)
Write-Host "`nTest 5: Invalid dimensions (should fail)..." -ForegroundColor Yellow
$body = @{
    width = 100
    height = 100
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✗ FAIL: Should have been rejected (got 200)" -ForegroundColor Red
    $Failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✓ PASS: Invalid dimensions rejected (HTTP 400)" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "✗ FAIL: Wrong error code ($($_.Exception.Response.StatusCode.value__))" -ForegroundColor Red
        $Failed++
    }
}

# Test 6: Check cell count
Write-Host "`nTest 6: Verify cell count (20x20 = 400 cells)..." -ForegroundColor Yellow
$body = @{
    width = 20
    height = 20
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    $cellCount = $response.maze.cells.PSObject.Properties.Count
    
    if ($cellCount -eq 400) {
        Write-Host "✓ PASS: Cell count is correct (400)" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "✗ FAIL: Expected 400 cells, got $cellCount" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "✗ FAIL: Request failed - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Test 7: Response time
Write-Host "`nTest 7: Response time check..." -ForegroundColor Yellow
$body = @{
    width = 15
    height = 15
} | ConvertTo-Json

try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    $end = Get-Date
    $elapsed = ($end - $start).TotalMilliseconds
    
    if ($elapsed -lt 5000) {
        Write-Host "PASS: Response time OK ($([math]::Round($elapsed, 0))ms < 5000ms)" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "FAIL: Response too slow ($([math]::Round($elapsed, 0))ms)" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "✗ FAIL: Request failed - $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

# Résultats
Write-Host ""
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "Results: " -NoNewline
Write-Host "$Passed passed" -ForegroundColor Green -NoNewline
Write-Host ", " -NoNewline
Write-Host "$Failed failed" -ForegroundColor Red
Write-Host ("=" * 50) -ForegroundColor Cyan

if ($Failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed!" -ForegroundColor Red
    exit 1
}
