# 🚀 一键云部署指南

## 准备工作
1. GitHub账号
2. Vercel账号 (免费)
3. Railway账号 (免费)

## 步骤1: 后端部署到Railway

### 1.1 创建Railway项目
```bash
1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. 选择 backend 目录
```

### 1.2 配置环境变量
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
LOG_LEVEL=info
```

### 1.3 获取部署URL
```
部署完成后会得到类似：
https://influxdb-nocode-backend-production.up.railway.app
```

## 步骤2: 前端部署到Vercel

### 2.1 创建Vercel项目
```bash
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入GitHub仓库
4. 选择根目录 (不是backend目录)
```

### 2.2 配置环境变量
```
VITE_API_URL=https://your-backend.railway.app/api
```

### 2.3 更新vercel.json
将Railway的实际URL替换到vercel.json中。

## 步骤3: 测试部署

### 3.1 访问前端
```
https://your-app.vercel.app
```

### 3.2 测试API
```
https://your-app.vercel.app/api/health
```

## 优势
✅ 完全免费 (在免费额度内)
✅ 自动HTTPS
✅ 全球CDN
✅ 自动部署
✅ 无需服务器维护
✅ 高可用性

## 用户使用
用户只需要：
1. 访问你的Vercel URL
2. 输入他们自己的InfluxDB连接信息
3. 开始使用无代码界面

用户的InfluxDB可以在任何地方：
- 本地部署
- InfluxDB Cloud
- 其他云服务商
