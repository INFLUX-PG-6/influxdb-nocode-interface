# 🔧 Alternative Deployment Methods

## If GitHub OAuth Issues Occur

### Method 1: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway init
railway up
```

### Method 2: Direct Upload
1. **Zip backend folder**
2. **Upload to Railway**:
   - Go to Railway dashboard
   - "New Project" → "Empty Project"
   - Upload zip file
3. **Configure environment variables**

### Method 3: Alternative Git Hosting
- Use GitLab, Bitbucket, or other Git providers
- Connect to deployment platforms
- Same configuration applies

## Local Development
```bash
# Frontend
npm run dev

# Backend
cd backend
npm run dev
```

## Docker Deployment
```bash
# Build backend image
cd backend
docker build -t influxdb-nocode-backend .

# Run container
docker run -p 3001:3001 influxdb-nocode-backend
```

## Troubleshooting
- **OAuth Issues**: Use CLI methods
- **Build Failures**: Check logs in platform dashboard
- **Network Issues**: Verify CORS and proxy settings