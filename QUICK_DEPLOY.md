# Quick Deployment Guide

## To Deploy the Fix:

### Option 1: Using Git (Recommended)
```powershell
# Navigate to project root
cd "c:\Users\vinay\OneDrive\Desktop\Imarcitus\imarticus-lms-project"

# Check what files were changed
git status

# Add the changes
git add backend/render.yaml backend/routes/adminRoutes.js backend/test-azure-openai.js SUMMARIZATION_FIX.md

# Commit the changes
git commit -m "Fix: Add Azure OpenAI environment variables for PDF summarization feature"

# Push to trigger automatic deployment on Render
git push origin main
```

### Option 2: Manual Configuration on Render Dashboard

If you prefer not to commit API keys to the repository:

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `imarticus-lms-backend` service
3. Go to "Environment" tab
4. Add the following environment variables:
   - `AZURE_OPENAI_ENDPOINT` = `https://devtinder.openai.azure.com/`
   - `AZURE_OPENAI_API_KEY` = `YOUR_AZURE_OPENAI_API_KEY_HERE`
   - `AZURE_OPENAI_CHATGPT_DEPLOYMENT` = `gpt-4.1`
   - `AZURE_OPENAI_CHATGPT_MODEL` = `gpt-4.1`
   - `AZURE_OPENAI_API_VERSION` = `2025-01-01-preview`
5. Click "Save Changes"
6. Render will automatically redeploy

## After Deployment:

1. Wait for Render to complete deployment (usually 2-5 minutes)
2. Visit your site: https://imarticus-lms.netlify.app
3. Login and navigate to any course
4. Select a lesson with a PDF document
5. Click "🤖 Summarise with AI" button
6. Verify that the summary is generated successfully

## Troubleshooting:

If it still doesn't work:
1. Check Render logs for error messages
2. Verify environment variables in Render dashboard
3. Test locally with: `node backend/test-azure-openai.js`
4. Ensure the deployment completed successfully

## Files Modified:
- ✅ `backend/render.yaml` - Added Azure OpenAI env vars
- ✅ `backend/routes/adminRoutes.js` - Enhanced error handling
- ✅ `backend/test-azure-openai.js` - New test script (created)
- ✅ `SUMMARIZATION_FIX.md` - Documentation (created)
