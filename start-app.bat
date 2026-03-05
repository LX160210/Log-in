@echo off
setlocal

cd /d "%~dp0"

echo [1/3] 检查 npm 是否可用...
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo 未检测到 npm，请先安装 Node.js。
  pause
  exit /b 1
)

echo [2/3] 检查依赖...
if not exist "node_modules" (
  echo 首次运行，正在安装依赖，请稍候...
  call npm.cmd install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo [3/3] 启动后端服务并打开浏览器...
start "Front-end Server" cmd /k "cd /d %~dp0 && npm.cmd start"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo 已完成：服务已启动，浏览器已打开。
echo 如需让同一局域网其他设备访问，请使用你的内网IP:3000。
pause
