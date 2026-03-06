@echo off
setlocal
chcp 65001 >nul

cd /d "%~dp0"
set "TARGET_URL=http://localhost:3000/html/index.html"

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

echo [3/3] 检查服务状态并打开浏览器...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%TARGET_URL%' -Method GET -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo 检测到服务已在运行，直接打开页面。
  goto open_browser
)

set "PORT_PID="
for /f %%P in ('powershell -NoProfile -Command "$pidValue = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue ^| Select-Object -First 1 -ExpandProperty OwningProcess; if ($pidValue) { Write-Output $pidValue }" 2^>nul') do set "PORT_PID=%%P"
if defined PORT_PID (
  echo 端口 3000 已被其他进程占用，无法启动新服务。
  echo 占用进程 PID: %PORT_PID%
  echo 请先关闭占用进程，或修改服务端口后重试。
  pause
  exit /b 1
)

start "Front-end Server" cmd /k "cd /d ""%~dp0"" && npm.cmd start"
set /a RETRY=0

:wait_server
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%TARGET_URL%' -Method GET -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto open_browser

set /a RETRY+=1
if %RETRY% GEQ 20 goto open_browser
timeout /t 1 /nobreak >nul
goto wait_server

:open_browser
start "" "%TARGET_URL%"

echo 已完成：服务已启动，浏览器已打开。
echo 如需让同一局域网其他设备访问，请使用你的内网IP:3000。
pause
