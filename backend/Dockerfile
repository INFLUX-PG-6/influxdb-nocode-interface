# 使用官方Node.js运行时作为父镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 删除开发依赖以减小镜像大小
RUN npm ci --omit=dev && npm cache clean --force

# 创建logs目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3001

# 定义环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]
