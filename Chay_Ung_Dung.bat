@echo off
title Giao Vien So Tieu Hoc Ninh Phuoc
cd /d "%~dp0"
echo ========================================================
echo   UNG DUNG GIAO VIEN SO TIEU HOC NINH PHUOC
echo ========================================================
echo Dang khoi dong may chu web va mo trinh duyet...
start "" http://localhost:3000
npm run dev
pause
