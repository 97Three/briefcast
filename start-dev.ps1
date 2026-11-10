# 快速启动脚本（PowerShell）

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "会前30天简报 - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] 正在启动后端服务..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\python.exe -m uvicorn sourcebound.api:app --reload"
Start-Sleep -Seconds 3

Write-Host "[2/2] 正在启动前端服务..." -ForegroundColor Yellow
Set-Location frontend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "后端服务: " -NoNewline
Write-Host "http://127.0.0.1:8000" -ForegroundColor Blue
Write-Host "前端应用: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Blue
Write-Host "API文档:  " -NoNewline
Write-Host "http://127.0.0.1:8000/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "按 Ctrl+C 关闭此窗口（服务将继续在独立窗口运行）"
