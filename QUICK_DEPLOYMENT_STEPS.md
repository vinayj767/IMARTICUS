# 🚀 QUICK DEPLOYMENT STEPS

## ✅ Step 1: Code Pushed to GitHub ✓

Your code is now on GitHub at: https://github.com/vinayj767/IMARTICUS

---

## 🔧 Step 2: Deploy Backend on Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render:**
   - Visit: https://dashboard.render.com
   - Login with your account

2. **Create New Web Service:**
   - Click **"New +"** button
   - Select **"Web Service"**

3. **Connect GitHub:**
   - Click **"Connect account"** (if first time)
   - Or select your GitHub account
   - Choose repository: **`vinayj767/IMARTICUS`**
   - Click **"Connect"**

4. **Configure Service:**
   ```
   Name: imarticus-lms-backend
   Region: Singapore
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

5. **Add Environment Variables:**
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these one by one:
   
   ```
   NODE_ENV = production
   
   PORT = 5000
   
   MONGO_URI = mongodb+srv://vinaywbackup_db_user:vinayjain@priject.6tsvkwd.mongodb.net/imarticus-lms?retryWrites=true&w=majority&appName=Priject
   
   FRONTEND_URL = https://imarticus-lms.netlify.app
   
   JWT_SECRET = your_super_secure_jwt_secret_change_this_in_production_12345
   
   RAZORPAY_KEY_ID = rzp_test_1hvQh7HTjEfHCo
   
   RAZORPAY_KEY_SECRET = 77GV69Z4HNFS28RW1TH8g89n
   
   RAZORPAY_WEBHOOK_SECRET = iamdevtinder
   ```
   
   Optional (for AI document summarization):
   ```
   AZURE_OPENAI_API_KEY = (your Azure OpenAI key)
   AZURE_OPENAI_ENDPOINT = (your Azure OpenAI endpoint)
   AZURE_OPENAI_DEPLOYMENT_NAME = gpt-4o-mini
   ```

6. **Enable Auto-Deploy:**
   - Check **"Auto-Deploy"** checkbox
   - This will automatically deploy when you push to GitHub

7. **Click "Create Web Service"**

8. **Wait for Deployment:**
   - Takes 2-3 minutes
   - Watch the logs for any errors
   - Status will change to **"Live"** when ready

9. **Copy Your Backend URL:**
   - Should be: `https://imarticus-lms-backend.onrender.com`
   - Or similar with random characters

10. **Test Backend:**
    - Visit: `https://imarticus-lms-backend.onrender.com/api/health`
    - Should see: `{"status":"ok"}`

---

## 🌐 Step 3: Deploy Frontend on Netlify

### Option A: Using Netlify Dashboard (Recommended)

1. **Go to Netlify:**
   - Visit: https://app.netlify.com
   - Login with your account

2. **Create New Site:**
   - Click **"Add new site"**
   - Select **"Import an existing project"**

3. **Connect to GitHub:**
   - Click **"Deploy with GitHub"**
   - Authorize Netlify (if first time)
   - Search for: **`IMARTICUS`**
   - Click your repository

4. **Configure Build Settings:**
   ```
   Site name: imarticus-lms (or choose your own)
   Branch to deploy: main
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

5. **Add Environment Variables:**
   
   Click **"Show advanced"** → **"New variable"**
   
   Add this:
   ```
   REACT_APP_API_URL = https://imarticus-lms-backend.onrender.com/api
   ```
   
   ⚠️ **IMPORTANT:** Replace with YOUR actual Render backend URL from Step 2!

6. **Click "Deploy site"**

7. **Wait for Deployment:**
   - Takes 1-2 minutes
   - Watch build logs for any errors
   - Status will change to **"Published"** when ready

8. **Your Site is Live! 🎉**
   - Netlify gives you a URL like: `https://imarticus-lms.netlify.app`
   - Or: `https://random-name-123456.netlify.app`

9. **Test Frontend:**
   - Visit your Netlify URL
   - Should see login page
   - Try logging in with:
     - Student: `student@test.com` / `student123`
     - Admin: `admin@imarticus.com` / `admin123`

---

## ✅ Step 4: Verify Everything Works

### Backend Checks:

```bash
# 1. Health check
curl https://your-backend-url.onrender.com/api/health

# 2. Get courses
curl https://your-backend-url.onrender.com/api/courses

# Should see list of courses
```

### Frontend Checks:

1. **Visit your Netlify URL**
2. **Login as Student:**
   - Email: `student@test.com`
   - Password: `student123`
   - Should redirect to Student Dashboard
   - Should see enrolled courses

3. **Test Course Access:**
   - Click a course
   - Should see course content
   - Try marking lessons complete
   - Progress should update

4. **Login as Admin:**
   - Logout
   - Login with: `admin@imarticus.com` / `admin123`
   - Should see Admin Dashboard
   - Check Analytics tab
   - Should see revenue and student progress

5. **Test Payment Flow:**
   - Login as student
   - Find a course you're not enrolled in
   - Click "Enroll Now"
   - Complete test payment
   - Should be enrolled and redirected to dashboard

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"

**Fix:**
1. Make sure backend is deployed and live on Render
2. Check the backend URL in Netlify environment variables
3. Backend might be "sleeping" (free tier) - wait 30 seconds and try again

### Issue: "CORS Error"

**Fix:**
1. In Render dashboard → Environment → Check `FRONTEND_URL`
2. Should match your Netlify URL exactly
3. Re-deploy backend after changing

### Issue: "MongoDB connection failed"

**Fix:**
1. Check `MONGO_URI` in Render environment variables
2. Make sure MongoDB Atlas allows connections from anywhere:
   - Go to MongoDB Atlas
   - Network Access
   - Add IP: `0.0.0.0/0`

### Issue: "Build failed on Netlify"

**Fix:**
1. Check build logs in Netlify
2. Make sure `REACT_APP_API_URL` is set correctly
3. Try re-deploying

---

## 🎯 URLs After Deployment

**Backend API:** https://imarticus-lms-backend.onrender.com/api  
**Frontend App:** https://imarticus-lms.netlify.app  
**GitHub Repo:** https://github.com/vinayj767/IMARTICUS  

**Admin Login:**
- Email: `admin@imarticus.com`
- Password: `admin123`

**Student Login:**
- Email: `student@test.com`
- Password: `student123`

---

## 🔄 Future Updates

**To deploy updates:**

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Automatic deployment happens!**
   - Render rebuilds backend (2-3 min)
   - Netlify rebuilds frontend (1-2 min)

---

## 📊 Monitoring

### Render Logs:
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor for errors

### Netlify Logs:
1. Go to Netlify dashboard
2. Select your site
3. Click "Deploys" tab
4. View build logs

---

## 🎉 DONE!

Once both services are deployed and live:

✅ Your LMS is accessible worldwide  
✅ Students can register and enroll  
✅ Payments work through Razorpay  
✅ Admin can manage courses  
✅ Progress tracking works  
✅ Auto-deploys on git push  

**Share your live URL with users!** 🚀
