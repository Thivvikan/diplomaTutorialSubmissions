@echo off
echo ========================================================
echo Pushing Diploma Practical Submissions to GitHub...
echo Target Repo: https://github.com/Thivvikan/diplomaTutorialSubmissions.git
echo ========================================================
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Your repository is ready to import on Vercel:
    echo https://vercel.com/new
) else (
    echo.
    echo [ERROR] Push failed. If this is a new private repo, please ensure you are signed into GitHub.
)
echo.
pause
