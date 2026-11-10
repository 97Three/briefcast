@echo off
echo ========================================
echo 会前30天简报 - 启动脚本
echo ========================================
echo.

echo [1/2] 正在启动后端服务...
start "Backend Server" cmd /k ".\.venv\Scripts\python.exe -m uvicorn sourcebound.api:app --reload"
timeout /t 3 /nobreak >nul

echo [2/2] 正在启动前端服务...
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo 启动完成！
echo ========================================
echo.
echo 后端服务: http://127.0.0.1:8000
echo 前端应用: http://localhost:5173
echo API文档:  http://127.0.0.1:8000/docs
echo.
echo 按任意键退出此窗口（服务将继续在独立窗口运行）
pause >nul
