@echo off
cls
echo ======================================================================
echo           SenseSphere AI - Deploy to GitHub (harsha157-naidu)
echo ======================================================================
echo.
echo Step 1: Ensure your repository is created on GitHub
echo         URL: https://github.com/new
echo         Repository name: SenseSphere-AI  (or Chat-bot)
echo         Make sure "Add a README" is UNCHECKED (empty repo)
echo.
echo Step 2: Pushing files to https://github.com/harsha157-naidu/SenseSphere-AI.git
echo.
"C:\Users\harsh\.local\git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] All files deployed directly to GitHub!
    echo  View repository: https://github.com/harsha157-naidu/SenseSphere-AI
    echo ======================================================================
) else (
    echo.
    echo ----------------------------------------------------------------------
    echo  Notice: If the repository doesn't exist yet or needs authentication,
    echo  either create it at https://github.com/new, or run:
    echo    git push -u origin main
    echo ----------------------------------------------------------------------
)
echo.
pause
