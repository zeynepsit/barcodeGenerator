@echo off
echo ====================================
echo   Gozluk Marketi Uygulamasi
echo ====================================
echo.
echo Docker kontrol ediliyor...
docker ps >nul 2>&1
if errorlevel 1 (
    echo.
    echo HATA: Docker Desktop calismiyhor!
    echo Lutfen Docker Desktop'i acin ve tekrar deneyin.
    echo.
    pause
    exit /b 1
)

echo Docker hazir!
echo.
echo Uygulama baslatiliyor...
docker compose up -d

echo.
echo Uygulama baslatildi!
echo.
echo 15 saniye sonra tarayici otomatik acilacak...
timeout /t 15 /nobreak >nul

start http://localhost

echo.
echo Uygulamayi kapatmak icin 'durdur.bat' dosyasini calistirin.
pause

