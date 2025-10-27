@echo off
setlocal enabledelayedexpansion

echo Thai MOOC - Standalone Package Builder
echo ==========================================
echo.

:: Check if build exists
if not exist ".next\standalone" (
    echo Error: .next\standalone not found!
    echo Please run 'npm run build' first
    pause
    exit /b 1
)

:: Create package directory with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set PACKAGE_DIR=thai-mooc-standalone-%datetime:~0,8%-%datetime:~8,6%
echo Creating package directory: %PACKAGE_DIR%
mkdir "%PACKAGE_DIR%"

:: Copy standalone files
echo Copying standalone build...
xcopy /E /I /Y ".next\standalone\*" "%PACKAGE_DIR%\" > nul

:: Copy public files
echo Copying public assets...
if exist "public" (
    mkdir "%PACKAGE_DIR%\public" 2>nul
    xcopy /E /I /Y "public\*" "%PACKAGE_DIR%\public\" > nul
)

:: Copy .next/static
echo Copying static files...
mkdir "%PACKAGE_DIR%\.next\static" 2>nul
xcopy /E /I /Y ".next\static\*" "%PACKAGE_DIR%\.next\static\" > nul

:: Create .env.example
echo Creating environment template...
(
echo # Database Connection
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=your_db_user
echo DB_PASSWORD=your_db_password
echo DB_NAME=thai_mooc
echo.
echo DATABASE_URL="mysql://your_db_user:your_db_password@localhost:3306/thai_mooc"
echo.
echo # JWT Secret
echo JWT_SECRET=change-this-to-a-random-secret-key-in-production
echo.
echo # Production Settings
echo NODE_ENV=production
echo NEXT_PUBLIC_API_URL=https://yourdomain.com
echo PORT=3000
echo HOSTNAME=0.0.0.0
) > "%PACKAGE_DIR%\.env.example"

:: Create README
echo Creating README...
(
echo Thai MOOC - Standalone Package
echo ================================
echo.
echo Installation on Web Hosting:
echo.
echo 1. Upload all files to your hosting
echo    ^(Recommended: compress as .zip before upload^)
echo.
echo 2. Edit .env file:
echo    - Rename .env.example to .env
echo    - Update database credentials
echo    - Change JWT_SECRET to new value
echo    - Update your domain
echo.
echo 3. Create database and import schema:
echo    - Use database-schema.sql
echo    - Or read DEPLOYMENT_NO_NPM_ACCESS.md
echo.
echo 4. Start the application:
echo.
echo    Via cPanel Node.js App:
echo    - Application root: select uploaded folder
echo    - Application startup file: server.js
echo    - Node.js version: 18.x or higher
echo    - Application mode: Production
echo.
echo    Via Command Line ^(if you have SSH^):
echo    - node server.js
echo    or
echo    - pm2 start server.js --name thai-mooc
echo.
echo 5. Open website:
echo    - https://yourdomain.com
echo.
echo Notes:
echo - This package does NOT require npm install
echo - Contains only necessary dependencies
echo - Small size, fast upload
echo.
echo For more instructions:
echo - Read DEPLOYMENT_NO_NPM_ACCESS.md
echo - Read NODEJS_HOSTING_DEPLOYMENT.md
) > "%PACKAGE_DIR%\README.txt"

:: Copy database schema (create if exists)
echo Creating database schema...
copy "database-schema.sql" "%PACKAGE_DIR%\database-schema.sql" 2>nul

:: Compress to zip
echo Compressing package...
powershell -command "Compress-Archive -Path '%PACKAGE_DIR%' -DestinationPath '%PACKAGE_DIR%.zip' -Force"

:: Get file size
for %%A in ("%PACKAGE_DIR%.zip") do set SIZE=%%~zA
set /a SIZE_MB=%SIZE% / 1048576

:: Clean up
echo Cleaning up...
rmdir /S /Q "%PACKAGE_DIR%"

:: Summary
echo.
echo ========================================
echo Package created successfully!
echo ========================================
echo.
echo Package: %PACKAGE_DIR%.zip
echo Size: %SIZE_MB% MB
echo.
echo Next steps:
echo 1. Upload %PACKAGE_DIR%.zip to your hosting
echo 2. Extract the archive
echo 3. Configure .env file
echo 4. Import database-schema.sql
echo 5. Start the app with: node server.js
echo.
echo For detailed instructions, see:
echo    - README.txt ^(inside the package^)
echo    - DEPLOYMENT_NO_NPM_ACCESS.md
echo.
pause
