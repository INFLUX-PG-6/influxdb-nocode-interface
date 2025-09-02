# 🔧 替代部署方案

## 如果GitHub OAuth出现问题，可以使用以下替代方案：

### 方案1: 使用Railway CLI
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway
railway login

# 在backend目录部署
cd backend
railway init
railway up
```

### 方案2: 使用Docker部署到其他平台

#### Render.com部署
1. 访问 https://render.com
2. 连接GitHub仓库
3. 选择backend目录
4. 使用Dockerfile部署

#### Heroku部署
```bash
# 安装Heroku CLI
# 在backend目录
heroku create your-app-name
heroku container:push web
heroku container:release web
```

### 方案3: 手动上传代码
1. 下载代码为ZIP
2. 在Railway/Vercel中选择"上传文件夹"
3. 上传backend/frontend文件夹

### 方案4: 使用不同的浏览器
- 尝试Firefox、Safari、Edge等
- 确保浏览器允许第三方cookies
