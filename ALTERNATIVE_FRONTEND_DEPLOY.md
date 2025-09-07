# 🚀 Alternative Frontend Deployment

## 1. Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 2. GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

## 3. Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## 4. Surge.sh
```bash
# Install Surge
npm install -g surge

# Build and deploy
npm run build
surge dist
```

## Configuration Notes

### Environment Variables
Set `VITE_API_URL` to your backend URL in each platform:
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment variables
- Firebase: Firebase console → Hosting → Environment config

### Redirects
For SPA routing, add redirects:
```
# _redirects (Netlify)
/api/*  https://your-backend-url/api/:splat  200
/*      /index.html   200
```

## Testing
1. Verify frontend loads correctly
2. Test API connectivity
3. Check browser console for errors