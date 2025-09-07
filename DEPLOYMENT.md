# 🚀 Cloud Deployment Guide

## Prerequisites
- GitHub account
- Railway account (free)
- Netlify account (free)

## Step 1: Deploy Backend (Railway)

### Setup
1. Visit https://railway.app
2. "Start a New Project" → "Deploy from GitHub repo"
3. Select your repository → Choose `backend` folder

### Environment Variables
```
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### Get Deployment URL
After deployment, you'll get: `https://your-app.up.railway.app`

## Step 2: Deploy Frontend (Netlify)

### Setup
1. Visit https://netlify.com
2. "New site from Git" → Connect to GitHub
3. Select your repository

### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

### Environment Variables
```
VITE_API_URL=https://YOUR_RAILWAY_URL/api
```

### Redirects
Create `public/_redirects`:
```
/api/*  https://YOUR_RAILWAY_URL/api/:splat  200
/*      /index.html   200
```

## Step 3: Update CORS

Add to Railway environment:
```
FRONTEND_URL=https://YOUR_NETLIFY_URL
```

## Testing

1. Visit your Netlify URL
2. Test InfluxDB connection with your credentials:
   - URL: Your InfluxDB instance URL
   - Organization: Your org name/ID
   - Token: Your API token
3. Browse data sources and run queries

## Troubleshooting

- **CORS Error**: Check FRONTEND_URL in Railway
- **API 404**: Verify VITE_API_URL in Netlify
- **Build Failed**: Check build logs for missing dependencies

## Live Demo
- Frontend: https://influxdb-nocode-interface.netlify.app
- Backend: https://influxdb-nocode-interface-production.up.railway.app