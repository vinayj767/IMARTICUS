#!/bin/bash
# Force Netlify Redeploy Script

echo "🚀 Forcing Netlify Redeploy..."
echo ""
echo "Method 1: Manual Redeploy on Netlify Dashboard"
echo "1. Go to: https://app.netlify.com"
echo "2. Click your site: imarticus-lms"
echo "3. Click 'Deploys' tab"
echo "4. Click 'Trigger deploy' button (top right)"
echo "5. Click 'Deploy site'"
echo ""
echo "Method 2: Git Commit (Automatic)"
echo "Making a small change to trigger deploy..."

# Create a timestamp file to trigger deployment
echo "Last deployed: $(date)" > .netlify-deploy-trigger.txt

echo "✅ Trigger file created!"
echo ""
echo "Now run:"
echo "  git add .netlify-deploy-trigger.txt"
echo "  git commit -m 'Trigger Netlify redeploy with Redis'"
echo "  git push origin main"
echo ""
echo "Netlify will auto-deploy in 1-2 minutes! 🚀"
