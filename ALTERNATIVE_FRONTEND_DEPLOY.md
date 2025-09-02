# 🚀 前端替代部署方案

## 1. Netlify (推荐替代方案)
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 在项目根目录登录
netlify login

# 构建项目
npm run build

# 部署
netlify deploy --prod --dir=dist
```

## 2. GitHub Pages
```bash
# 安装gh-pages
npm install -g gh-pages

# 构建并部署
npm run build
npx gh-pages -d dist
```

## 3. Surge.sh
```bash
# 安装surge
npm install -g surge

# 构建项目
npm run build

# 部署
cd dist
surge . your-app-name.surge.sh
```

## 4. Firebase Hosting
```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录Firebase
firebase login

# 初始化项目
firebase init hosting

# 构建并部署
npm run build
firebase deploy
```
