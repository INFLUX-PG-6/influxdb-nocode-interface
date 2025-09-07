# 🚀 Deployment Guide

## Current Status ✅
- [x] Code ready
- [x] Git repository initialized
- [x] Code committed

## Quick Deployment Steps

### 1. Create GitHub Repository
1. Visit https://github.com
2. Click "New repository"
3. Name: `influxdb-nocode-interface`
4. Set to Public
5. Don't add README
6. Click "Create repository"

### 2. Push Code
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/influxdb-nocode-interface.git
git branch -M main
git push -u origin main
```

### 3. Deploy Backend (Railway)
1. Visit https://railway.app
2. "Start a New Project" → "Deploy from GitHub repo"
3. Select your repository → Choose `backend` folder
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   LOG_LEVEL=info
   ```
5. Wait for deployment
6. Save your Railway URL (e.g., https://xxx.railway.app)

### 4. Deploy Frontend (Netlify)
1. Visit https://netlify.com
2. "New site from Git" → Select your GitHub repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   ```
   VITE_API_URL=https://YOUR_RAILWAY_URL/api
   ```
5. Deploy

### 5. Update CORS
Add to Railway environment variables:
```
FRONTEND_URL=https://YOUR_NETLIFY_URL
```

### 6. Test
1. Visit your Netlify URL
2. Test InfluxDB connection
3. Verify data browsing and queries

## Need Help?
Contact support if you encounter issues at any step.