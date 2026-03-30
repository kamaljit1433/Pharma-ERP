# PowerShell setup script to install Git hooks

Write-Host "🔧 Setting up Git hooks..." -ForegroundColor Cyan

# Configure Git to use .githooks directory
git config core.hooksPath .githooks

Write-Host "✅ Git hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configured hooks:" -ForegroundColor Yellow
Write-Host "  - pre-push: Prevents direct pushes to main branch"
Write-Host "  - commit-msg: Enforces conventional commit format"
Write-Host ""
Write-Host "To bypass hooks (not recommended):" -ForegroundColor Yellow
Write-Host "  git push --no-verify"
Write-Host "  git commit --no-verify"
