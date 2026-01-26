# HandtoHand - Environment Setup Script

Write-Host "Setting up HandtoHand development environment..." -ForegroundColor Green

# Check if .env.local exists in web directory
if (!(Test-Path "web\.env.local")) {
    Write-Host "Creating web/.env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" "web\.env.local"
    Write-Host "✓ Created web/.env.local" -ForegroundColor Green
} else {
    Write-Host "web/.env.local already exists" -ForegroundColor Cyan
}

# Check if .env exists in mobile directory
if (!(Test-Path "mobile\.env")) {
    Write-Host "Creating mobile/.env from template..." -ForegroundColor Yellow
    Copy-Item "mobile\.env.example" "mobile\.env"
    Write-Host "✓ Created mobile/.env" -ForegroundColor Green
} else {
    Write-Host "mobile/.env already exists" -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Install Supabase CLI: https://supabase.com/docs/guides/cli" -ForegroundColor White
Write-Host "2. Run 'supabase start' to start local Supabase" -ForegroundColor White
Write-Host "3. Copy the anon key and service role key to your .env files" -ForegroundColor White
Write-Host "4. Run 'npm run db:push' to push the database schema" -ForegroundColor White
Write-Host "5. Run 'npm run dev:web' to start the web app" -ForegroundColor White
Write-Host "6. Run 'npm run dev:mobile' to start the mobile app" -ForegroundColor White
