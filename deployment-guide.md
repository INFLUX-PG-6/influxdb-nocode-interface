# 部署指南

## 选项1: Vercel + Railway 部署

### 前端部署 (Vercel)
1. **构建配置**
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.railway.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **环境变量**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

### 后端部署 (Railway)
1. **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

2. **环境变量**
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
```

## 选项2: Docker 容器化部署

### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:3001/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=http://localhost
```

## 选项3: 单服务器部署

### Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 选项4: 静态部署 + Serverless

### 前端: 静态托管 (Netlify/Vercel)
### 后端: Serverless Functions (Vercel Functions/Netlify Functions)

```javascript
// api/auth/connect.js (Vercel Functions)
export default async function handler(req, res) {
  // 认证逻辑
}
```
