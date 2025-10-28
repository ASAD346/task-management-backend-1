# PowerShell script to create initial admin
# Usage: .\create-admin.ps1 -VercelUrl "https://your-project.vercel.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelUrl
)

$body = @{
    name = "Admin User"
    email = "admin@taskmgmt.com"
    password = "Admin@123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Creating admin user at $VercelUrl/api/auth/create-admin..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$VercelUrl/api/auth/create-admin" -Method Post -Body $body -Headers $headers
    
    Write-Host "`n✅ Admin created successfully!" -ForegroundColor Green
    Write-Host "`nLogin Credentials:" -ForegroundColor Cyan
    Write-Host "Email: $($body.email)" -ForegroundColor White
    Write-Host "Password: Admin@123" -ForegroundColor White
    Write-Host "`nToken: $($response.token)" -ForegroundColor Yellow
    Write-Host "`nUser Info:" -ForegroundColor Cyan
    Write-Host ($response.user | ConvertTo-Json)
    
} catch {
    Write-Host "`n❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

