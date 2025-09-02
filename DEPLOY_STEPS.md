# 🚀 云部署步骤指南

## 当前状态 ✅
- [x] 代码准备完毕
- [x] Git仓库初始化
- [x] 代码已提交

## 接下来需要您操作的步骤

### 1. 创建GitHub仓库
1. 访问 https://github.com
2. 点击 "New repository"
3. 仓库名: `influxdb-nocode-interface`
4. 设置为 Public
5. 不要添加README
6. 点击 "Create repository"

### 2. 推送代码 (在终端执行)
```bash
# 替换YOUR_USERNAME为您的GitHub用户名
git remote add origin https://github.com/YOUR_USERNAME/influxdb-nocode-interface.git
git branch -M main
git push -u origin main
```

### 3. 部署后端到Railway
1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择刚创建的仓库
5. 选择 `backend` 文件夹
6. 设置环境变量:
   ```
   NODE_ENV=production
   PORT=3001
   LOG_LEVEL=info
   ```
7. 等待部署完成
8. 记录Railway给您的URL (类似: https://xxx.railway.app)

### 4. 部署前端到Vercel
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择刚创建的GitHub仓库
4. 选择根目录 (不是backend)
5. 设置环境变量:
   ```
   VITE_API_URL=https://YOUR_RAILWAY_URL/api
   ```
   (替换YOUR_RAILWAY_URL为步骤3中的Railway URL)
6. 点击 "Deploy"
7. 等待部署完成

### 5. 更新配置
部署完成后，需要更新后端的CORS配置:
1. 在Railway项目中添加环境变量:
   ```
   FRONTEND_URL=https://YOUR_VERCEL_URL
   ```
   (替换为您的Vercel URL)

### 6. 测试
1. 访问您的Vercel URL
2. 测试登录功能
3. 检查API连接

## 需要帮助?
如果遇到问题，请告诉我您在哪一步遇到了困难！
