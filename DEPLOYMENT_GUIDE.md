# 🚀 Deployment Guide - Imarticus LMS

## Date: October 4, 2025

---

## 📋 Deployment Overview

**Frontend:** Netlify (https://imarticus-lms.netlify.app)  
**Backend:** Render (https://imarticus-lms-backend.onrender.com)  
**Database:** MongoDB Atlas  

---

## 🔧 Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
# Navigate to project root
cd c:\Users\vinay\OneDrive\Desktop\Imarcitus\imarticus-lms-project

# Add all changes
git add .

# Commit changes
git commit -m "Fixed: Admin login, enrollment check, payment enrollment, access control"

# Push to GitHub
git push origin main
```

### Step 2: Render Configuration

**Already configured in `backend/render.yaml`:**

```yaml
services:
  - type: web
    name: imarticus-lms-backend
    env: node
    region: singapore
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        value: mongodb+srv://vinaywbackup_db_user:vinayjain@priject.6tsvkwd.mongodb.net/imarticus-lms?retryWrites=true&w=majority&appName=Priject
      - key: PORT
        value: 5000
      - key: FRONTEND_URL
        value: https://imarticus-lms.netlify.app
      - key: RAZORPAY_KEY_ID
        value: rzp_test_1hvQh7HTjEfHCo
      - key: RAZORPAY_KEY_SECRET
        value: 77GV69Z4HNFS28RW1TH8g89n
```

### Step 3: Deploy on Render

1. **Go to Render Dashboard:**
   - https://dashboard.render.com

2. **Create New Web Service:**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository: `vinayj767/IMARTICUS`

3. **Configure Service:**
   - **Name:** `imarticus-lms-backend`
   - **Region:** Singapore
   - **Branch:** main
   - **Root Directory:** `backend` (if monorepo) or leave empty
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://vinaywbackup_db_user:vinayjain@priject.6tsvkwd.mongodb.net/imarticus-lms?retryWrites=true&w=majority&appName=Priject
   PORT=5000
   FRONTEND_URL=https://imarticus-lms.netlify.app
   RAZORPAY_KEY_ID=rzp_test_1hvQh7HTjEfHCo
   RAZORPAY_KEY_SECRET=77GV69Z4HNFS28RW1TH8g89n
   JWT_SECRET=your_super_secure_jwt_secret_key_here_change_this_in_production
   AZURE_OPENAI_API_KEY=<your_azure_key>
   AZURE_OPENAI_ENDPOINT=<your_azure_endpoint>
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
   ```

5. **Auto-Deploy Settings:**
   - Enable "Auto-Deploy" - automatically deploys when you push to GitHub
   - Branch: `main`

6. **Click "Create Web Service"**

### Step 4: Verify Backend Deployment

Once deployed, test the API:

```bash
# Check health
curl https://imarticus-lms-backend.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "message": "Server is running"
}
```

**Backend URL:** `https://imarticus-lms-backend.onrender.com`

---

## 🌐 Frontend Deployment (Netlify)

### Step 1: Build Configuration

**Already configured in `frontend/netlify.toml`:**

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://imarticus-lms-backend.onrender.com/api"
```

**Production Environment (`frontend/.env.production`):**

```bash
REACT_APP_API_URL=https://imarticus-lms-backend.onrender.com/api
```

### Step 2: Deploy on Netlify

1. **Go to Netlify Dashboard:**
   - https://app.netlify.com

2. **Create New Site:**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository: `vinayj767/IMARTICUS`

3. **Configure Build Settings:**
   - **Base directory:** `frontend` (if monorepo) or leave empty
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Branch:** main

4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://imarticus-lms-backend.onrender.com/api
   ```

5. **Deploy Settings:**
   - Enable "Auto-Deploy" from GitHub
   - Branch: `main`

6. **Click "Deploy site"**

### Step 3: Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Add custom domain: `imarticus-lms.netlify.app`
3. Enable HTTPS (automatic)

### Step 4: Verify Frontend Deployment

Once deployed, visit:

```
https://imarticus-lms.netlify.app
```

**Test:**
- Login page should load
- Can login with test accounts
- API calls should work
- No CORS errors

---

## 🔄 Automated Deployment Workflow

### How It Works:

1. **Make changes locally**
2. **Commit to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. **Automatic deployment:**
   - Render detects push → Rebuilds backend
   - Netlify detects push → Rebuilds frontend
4. **Live in ~3-5 minutes!**

---

## 🧪 Post-Deployment Testing

### Test Backend APIs:

```bash
# 1. Health Check
curl https://imarticus-lms-backend.onrender.com/api/health

# 2. Get Courses
curl https://imarticus-lms-backend.onrender.com/api/courses

# 3. Login (POST)
curl -X POST https://imarticus-lms-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"student123"}'
```

### Test Frontend:

1. **Visit:** https://imarticus-lms.netlify.app
2. **Login as Student:**
   - Email: student@test.com
   - Password: student123
3. **Login as Admin:**
   - Email: admin@imarticus.com
   - Password: admin123
4. **Test Features:**
   - ✅ View courses
   - ✅ Enroll in course
   - ✅ Make payment
   - ✅ View progress
   - ✅ Admin dashboard
   - ✅ Upload documents

---

## 🔐 Security Checklist

### Before Going Live:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Enable MongoDB Atlas IP whitelist (or use 0.0.0.0/0 for Render)
- [ ] Use production Razorpay keys (not test keys)
- [ ] Enable HTTPS on both frontend and backend (automatic)
- [ ] Review CORS settings in `backend/server.js`
- [ ] Set strong admin password
- [ ] Enable rate limiting (if needed)
- [ ] Set up monitoring/logging

---

## 🐛 Common Deployment Issues

### Issue 1: "Cannot connect to backend"

**Cause:** Backend not deployed or wrong API URL

**Fix:**
1. Check backend is running: https://imarticus-lms-backend.onrender.com/api/health
2. Verify `REACT_APP_API_URL` in Netlify environment variables
3. Check CORS settings in backend

### Issue 2: "MongoDB connection failed"

**Cause:** Wrong MongoDB URI or IP not whitelisted

**Fix:**
1. Check `MONGO_URI` in Render environment variables
2. In MongoDB Atlas:
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add Render's IP addresses

### Issue 3: "Build failed on Netlify"

**Cause:** Build errors or missing dependencies

**Fix:**
1. Check build logs in Netlify dashboard
2. Ensure `package.json` has all dependencies
3. Run `npm run build` locally to test

### Issue 4: "404 on page refresh"

**Cause:** Missing redirect rules

**Fix:**
Already configured in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue 5: "Render service sleeping"

**Cause:** Free tier sleeps after 15 minutes of inactivity

**Fix:**
- First request after sleep takes 30-60 seconds to wake up
- Upgrade to paid plan for always-on service
- Or use a cron job to ping every 10 minutes

---

## 📊 Monitoring & Logs

### Render Logs:

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs

### Netlify Deploy Logs:

1. Go to Netlify Dashboard
2. Click your site
3. Go to "Deploys" tab
4. Click latest deploy to see logs

---

## 🔄 Rolling Back Deployment

### Render Rollback:

1. Go to service dashboard
2. Click "Deploy" dropdown
3. Select previous successful deploy
4. Click "Rollback to this deploy"

### Netlify Rollback:

1. Go to site dashboard
2. Click "Deploys" tab
3. Find previous working deploy
4. Click "Publish deploy"

---

## 📈 Performance Optimization

### Backend (Render):

- Enable caching for static assets
- Use Redis for session management
- Optimize database queries
- Enable compression middleware

### Frontend (Netlify):

- Code splitting (already done by React)
- Image optimization
- Enable Netlify CDN (automatic)
- Lazy load components

---

## 💰 Cost Breakdown

### Current Setup (Free Tier):

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Render** | Free | $0/month | 750 hours/month, sleeps after 15min |
| **Netlify** | Free | $0/month | 100GB bandwidth/month |
| **MongoDB Atlas** | Free | $0/month | 512MB storage |
| **Total** | - | **$0/month** | - |

### Recommended Paid Plans:

| Service | Plan | Cost | Benefits |
|---------|------|------|----------|
| **Render** | Starter | $7/month | Always on, no sleep |
| **Netlify** | Pro | $19/month | 1TB bandwidth, analytics |
| **MongoDB Atlas** | M10 | $10/month | 10GB storage, better performance |
| **Total** | - | **$36/month** | Production-ready |

---

## 🎯 Quick Deployment Commands

### First Time Deployment:

```bash
# 1. Navigate to project
cd c:\Users\vinay\OneDrive\Desktop\Imarcitus\imarticus-lms-project

# 2. Add all changes
git add .

# 3. Commit
git commit -m "Initial deployment: All features working"

# 4. Push to GitHub
git push origin main

# 5. Setup on Render.com (one-time)
# - Go to https://dashboard.render.com
# - Create new Web Service
# - Connect GitHub repo
# - Configure environment variables

# 6. Setup on Netlify (one-time)
# - Go to https://app.netlify.com
# - Import from GitHub
# - Configure build settings
```

### Subsequent Deployments:

```bash
# Make changes locally
# ...

# Commit and push
git add .
git commit -m "Your changes description"
git push origin main

# Automatic deployment happens!
# Render: ~2-3 minutes
# Netlify: ~1-2 minutes
```

---

## 📞 Support & Resources

### Documentation:
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- MongoDB Atlas: https://docs.atlas.mongodb.com

### Status Pages:
- Render Status: https://status.render.com
- Netlify Status: https://www.netlifystatus.com
- MongoDB Status: https://status.mongodb.com

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [x] All code committed to GitHub
- [x] Environment variables documented
- [x] Build tested locally
- [x] Database seeded with demo data
- [x] API endpoints tested
- [x] Frontend connecting to correct backend URL

### Backend (Render):
- [ ] Service created on Render
- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Auto-deploy enabled
- [ ] First deploy successful
- [ ] Health check endpoint working

### Frontend (Netlify):
- [ ] Site created on Netlify
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Auto-deploy enabled
- [ ] First deploy successful
- [ ] Can login and use app

### Post-Deployment:
- [ ] Test login (student & admin)
- [ ] Test course enrollment
- [ ] Test payment flow
- [ ] Test progress tracking
- [ ] Test admin dashboard
- [ ] Test document upload
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerts

---

## 🚀 READY TO DEPLOY!

**Current Status:**
- ✅ Code ready for deployment
- ✅ Config files in place
- ✅ Environment variables documented
- ✅ All recent fixes included:
  - Admin login blank page fixed
  - Enrollment check optimized
  - Payment enrollment working
  - Access control implemented
  - Infinite loop fixed

**Next Steps:**
1. Run the deployment commands below
2. Setup services on Render and Netlify
3. Test deployed application
4. Monitor for any issues

---

## 🎉 Let's Deploy!

```bash
# Run this now:
cd c:\Users\vinay\OneDrive\Desktop\Imarcitus\imarticus-lms-project
git add .
git commit -m "Production Ready: All bugs fixed, optimizations added"
git push origin main
```

Then setup on Render.com and Netlify.com following the steps above!
