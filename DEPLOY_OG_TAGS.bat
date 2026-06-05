@echo off
REM Dynamic OG Tags - Deployment Commands for Windows
REM Copy and run these commands to deploy the implementation

setlocal enabledelayedexpansion

echo ===============================================================
echo DYNAMIC OG TAGS DEPLOYMENT GUIDE
echo ===============================================================
echo.

REM Step 1: Deploy Backend
echo STEP 1: DEPLOY BACKEND CHANGES
echo ---------------------------------------------------------------
echo Run these commands from your project root:
echo.
echo   cd backend
echo   git add .
echo   git commit -m "Add dynamic OG tags support for social media sharing"
echo   git push origin main
echo.
echo Wait for Render deployment to complete (check dashboard)
echo.
pause

REM Step 2: Deploy Frontend
echo STEP 2: DEPLOY FRONTEND CHANGES
echo ---------------------------------------------------------------
echo Run these commands from project root:
echo.
echo   git add .
echo   git commit -m "Add dynamic meta tags for social media previews"
echo   git push origin main
echo.
echo Wait for Vercel deployment to complete (check dashboard)
echo.
pause

REM Step 3: Set Environment Variables
echo STEP 3: SET ENVIRONMENT VARIABLES (Vercel)
echo ---------------------------------------------------------------
echo Go to: Vercel Dashboard - Your Project - Settings - Environment Variables
echo.
echo Add these variables:
echo   VITE_API_BASE_URL = https://purandar.onrender.com
echo   VITE_APP_URL = https://purandarprimeproperties.com
echo.
echo Then trigger redeploy
echo.
pause

REM Step 4: Test
echo STEP 4: TEST THE IMPLEMENTATION
echo ---------------------------------------------------------------
echo Option 1: Quick Test (Facebook Share Debugger)
echo   1. Go to: https://developers.facebook.com/tools/debug/sharing/
echo   2. Enter: https://purandarprimeproperties.com/property/[property-id]
echo   3. Click 'Scrape Again'
echo   4. Should see property image, title, and description
echo.
echo Option 2: Direct API Test
echo   Visit: https://purandarprimeproperties.com/api/meta?propertyId=[id]
echo.
echo Option 3: Browser DevTools
echo   1. Visit property page
echo   2. Open DevTools (F12) - Elements tab
echo   3. Check for meta tags with property data
echo.
pause

REM Step 5: Real Platform Testing
echo STEP 5: TEST ON ACTUAL PLATFORMS
echo ---------------------------------------------------------------
echo Test these platforms:
echo   - WhatsApp: Share link in chat, check preview
echo   - Facebook: Share on timeline, check preview
echo   - LinkedIn: Share on profile, check preview
echo   - Twitter/X: Tweet the link, check card
echo   - Telegram: Share in chat, check preview
echo.
pause

echo ===============================================================
echo DEPLOYMENT COMPLETE
echo ===============================================================
echo.
echo Documentation files:
echo   - OG_TAGS_IMPLEMENTATION_SUMMARY.md
echo   - OG_TAGS_SETUP_CHECKLIST.md
echo   - DYNAMIC_OG_TAGS_GUIDE.md
echo.
echo Quick References:
echo   - Backend: https://purandar.onrender.com/api/v1/meta/property/[id]
echo   - Frontend: https://purandarprimeproperties.com/api/meta?propertyId=[id]
echo   - Property: https://purandarprimeproperties.com/property/[id]
echo.
echo Testing Tools:
echo   - Facebook: https://developers.facebook.com/tools/debug/sharing/
echo   - Twitter: https://cards-dev.twitter.com/validator
echo   - LinkedIn: https://www.linkedin.com/post-inspector/
echo.
pause
