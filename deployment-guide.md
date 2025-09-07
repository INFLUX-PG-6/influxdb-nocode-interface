# Deployment Guide

## Option 1: Netlify + Railway (Recommended)

### Frontend (Netlify)
```bash
# Build settings
Build command: npm run build
Publish directory: dist
```

### Backend (Railway)
```bash
# Auto-detected from Dockerfile
# Environment variables needed:
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
```

## Option 2: Vercel + Railway

### Frontend (Vercel)
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.railway.app/api/$1"
    }
  ]
}
```

## Environment Variables

### Frontend
```
VITE_API_URL=/api
```

### Backend
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url
LOG_LEVEL=info
```

## Testing Deployment

1. **Health Check**: Visit `https://your-backend-url/api/health`
2. **Frontend**: Visit your frontend URL
3. **Integration**: Test InfluxDB connection through UI

## Common Issues

- **CORS Error**: Update FRONTEND_URL in backend
- **API 404**: Check proxy/redirect configuration
- **Build Failed**: Verify all dependencies in package.json

## Live Example
- Frontend: https://influxdb-nocode-interface.netlify.app
- Backend: https://influxdb-nocode-interface-production.up.railway.app