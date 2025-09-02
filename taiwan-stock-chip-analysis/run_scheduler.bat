@echo off
echo ========================================
echo 台股籌碼自動收集排程器
echo ========================================

cd /d "%~dp0"

echo 檢查 Python 環境...
python --version
if %errorlevel% neq 0 (
    echo 錯誤: 找不到 Python，請確認已正確安裝 Python
    pause
    exit /b 1
)

echo.
echo 檢查依賴套件...
python -c "import schedule, pandas, requests" 2>nul
if %errorlevel% neq 0 (
    echo 安裝依賴套件...
    pip install -r requirements.txt
)

echo.
echo 啟動排程器...
echo 按 Ctrl+C 可停止排程器
echo.

python scheduler.py --run

echo.
echo 排程器已停止
pause