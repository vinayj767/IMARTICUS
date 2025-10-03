# ✅ DEPLOYMENT CHECKLIST

## 📦 Pre-Deployment

- [x] ✅ Code committed to Git
- [x] ✅ Code pushed to GitHub (https://github.com/vinayj767/IMARTICUS)
- [x] ✅ All bugs fixed:
  - [x] Admin login blank page
  - [x] Enrollment check infinite loop
  - [x] Payment enrollment issue
  - [x] Access control vulnerability
- [x] ✅ Config files ready:
  - [x] `backend/render.yaml`
  - [x] `frontend/netlify.toml`
  - [x] `frontend/.env.production`

---

## 🔧 Backend Deployment (Render.com)

### Setup Steps:

- [ ] 1. Go to https://dashboard.render.com
- [ ] 2. Click "New +" → "Web Service"
- [ ] 3. Connect GitHub repository: `vinayj767/IMARTICUS`
- [ ] 4. Configure service:
  - [ ] Name: `imarticus-lms-backend`
  - [ ] Region: Singapore
  - [ ] Branch: `main`
  - [ ] Build Command: `cd backend && npm install`
  - [ ] Start Command: `cd backend && npm start`
  - [ ] Instance Type: Free

- [ ] 5. Add Environment Variables:
  - [ ] `NODE_ENV` = production
  - [ ] `PORT` = 5000
  - [ ] `MONGO_URI` = (MongoDB connection string)
  - [ ] `FRONTEND_URL` = https://imarticus-lms.netlify.app
  - [ ] `JWT_SECRET` = (secure random string)
  - [ ] `RAZORPAY_KEY_ID` = rzp_test_1hvQh7HTjEfHCo
  - [ ] `RAZORPAY_KEY_SECRET` = (your secret)
  - [ ] `RAZORPAY_WEBHOOK_SECRET` = iamdevtinder

- [ ] 6. Enable "Auto-Deploy"
- [ ] 7. Click "Create Web Service"
- [ ] 8. Wait for deployment (2-3 minutes)
- [ ] 9. Check logs for errors
- [ ] 10. Copy backend URL: `___________________________`

### Verify Backend:

- [ ] Visit: `https://your-backend-url.onrender.com/api/health`
- [ ] Should see: `{"status":"ok"}`
- [ ] Test API: `https://your-backend-url.onrender.com/api/courses`
- [ ] Should see list of courses

---

## 🌐 Frontend Deployment (Netlify)

### Setup Steps:

- [ ] 1. Go to https://app.netlify.com
- [ ] 2. Click "Add new site" → "Import an existing project"
- [ ] 3. Connect GitHub → Select `vinayj767/IMARTICUS`
- [ ] 4. Configure build:
  - [ ] Site name: `imarticus-lms` (or custom)
  - [ ] Branch: `main`
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `frontend/build`

- [ ] 5. Add Environment Variable:
  - [ ] `REACT_APP_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`
  
  ⚠️ **IMPORTANT:** Use YOUR actual backend URL from Render!

- [ ] 6. Click "Deploy site"
- [ ] 7. Wait for deployment (1-2 minutes)
- [ ] 8. Check build logs for errors
- [ ] 9. Copy frontend URL: `___________________________`

### Verify Frontend:

- [ ] Visit your Netlify URL
- [ ] Login page should load
- [ ] No console errors
- [ ] Try logging in as student: `student@test.com` / `student123`
- [ ] Try logging in as admin: `admin@imarticus.com` / `admin123`

---

## 🧪 Post-Deployment Testing

### Test Backend APIs:

```bash
# Health check
- [ ] curl https://your-backend-url.onrender.com/api/health

# Get courses
- [ ] curl https://your-backend-url.onrender.com/api/courses

# Login
- [ ] curl -X POST https://your-backend-url.onrender.com/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"student@test.com","password":"student123"}'
```

### Test Frontend Features:

**As Student:**
- [ ] Login successful
- [ ] Can see student dashboard
- [ ] Can view enrolled courses
- [ ] Can browse all courses
- [ ] Can click course → see lock screen (if not enrolled)
- [ ] Can enroll in course
- [ ] Can make test payment
- [ ] After payment, course appears in "My Courses"
- [ ] Can access course content after enrollment
- [ ] Can mark lessons as complete
- [ ] Progress updates in real-time
- [ ] Logout works

**As Admin:**
- [ ] Login successful
- [ ] Can see admin dashboard
- [ ] Can view analytics
- [ ] Can see revenue (₹150,200)
- [ ] Can see student progress
- [ ] Can manage courses (view/edit/delete)
- [ ] Can upload documents
- [ ] Can access all course content (no lock screen)
- [ ] Logout works

### Test Critical Fixes:

- [ ] **Admin Login:** No blank page, shows dashboard immediately
- [ ] **Enrollment Check:** No infinite loop, loads in ~1 second
- [ ] **Payment Enrollment:** User automatically enrolled after payment
- [ ] **Access Control:** Unenrolled users see lock screen, not content
- [ ] **Progress Tracking:** Lessons can be marked complete, percentage updates
- [ ] **Network Tab:** Only 1 API call to `/api/auth/profile`, no WebSocket loops

---

## 🔐 Security Check

- [ ] Changed `JWT_SECRET` to strong random string
- [ ] MongoDB Atlas IP whitelist allows Render (0.0.0.0/0)
- [ ] CORS configured with correct frontend URL
- [ ] HTTPS enabled on both frontend and backend (automatic)
- [ ] Razorpay keys are test keys (change to production when ready)
- [ ] Admin password is strong
- [ ] No sensitive data in logs
- [ ] Environment variables not exposed in frontend

---

## 🎯 Final URLs

**Record your live URLs:**

- **Backend API:** `https://________________________________.onrender.com`
- **Frontend App:** `https://________________________________.netlify.app`
- **GitHub Repo:** `https://github.com/vinayj767/IMARTICUS`

**Test Accounts:**

**Admin:**
- Email: `admin@imarticus.com`
- Password: `admin123`

**Student:**
- Email: `student@test.com`
- Password: `student123`

---

## 📊 Monitoring Setup

### Render:
- [ ] Enabled email notifications for deploy failures
- [ ] Bookmarked logs page: https://dashboard.render.com
- [ ] Set up uptime monitoring (optional)

### Netlify:
- [ ] Enabled email notifications for deploy failures
- [ ] Bookmarked deploys page: https://app.netlify.com
- [ ] Checked analytics (optional)

---

## 🔄 Auto-Deploy Verification

**Test auto-deploy:**

1. Make a small change locally:
   ```bash
   # Edit a file, like README.md
   echo "# Updated $(date)" >> README.md
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

3. Verify:
   - [ ] Render dashboard shows new deploy in progress
   - [ ] Netlify dashboard shows new deploy in progress
   - [ ] Both complete successfully
   - [ ] Live sites show updated content

---

## 🐛 Known Issues

**Free Tier Limitations:**

- [ ] **Render:** Service sleeps after 15 minutes of inactivity
  - First request after sleep takes 30-60 seconds to wake up
  - Solution: Upgrade to paid plan or ping service every 10 minutes

- [ ] **Netlify:** 100GB bandwidth/month limit
  - For most use cases, this is plenty
  - Monitor usage in dashboard

- [ ] **MongoDB Atlas:** 512MB storage limit
  - Clean up old data periodically
  - Or upgrade to paid plan

---

## 📞 Support Resources

**If something goes wrong:**

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **MongoDB Atlas:** https://docs.atlas.mongodb.com

**Check Status Pages:**
- Render Status: https://status.render.com
- Netlify Status: https://www.netlifystatus.com
- MongoDB Status: https://status.mongodb.com

**Community:**
- Render Community: https://community.render.com
- Netlify Forums: https://answers.netlify.com

---

## 🎉 DEPLOYMENT COMPLETE!

**When all checkboxes are checked:**

✅ Your LMS is live and accessible worldwide!  
✅ Students can register, enroll, and learn  
✅ Admins can manage courses and track progress  
✅ Payments work through Razorpay  
✅ Auto-deploys on every git push  
✅ All bugs fixed and optimizations applied  

**Share your live URL and start onboarding users!** 🚀

---

## 📈 Next Steps (Optional)

**Enhancements:**

- [ ] Add custom domain (e.g., learn.yourdomain.com)
- [ ] Enable Razorpay production keys
- [ ] Set up email notifications for enrollments
- [ ] Add Google Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Create user documentation
- [ ] Add more courses
- [ ] Set up backup strategy
- [ ] Create marketing materials
- [ ] Launch announcement

**Upgrade Plans:**

- [ ] Render Starter ($7/month) - Always on, no sleep
- [ ] Netlify Pro ($19/month) - More bandwidth, analytics
- [ ] MongoDB M10 ($10/month) - Better performance
- **Total:** $36/month for production-ready hosting

---

**Date Deployed:** ________________  
**Deployed By:** Vinay Jain  
**Version:** 1.0.0 - Production Ready  
