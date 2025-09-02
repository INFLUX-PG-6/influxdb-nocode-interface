# 🔄 Fork项目到个人账户进行部署

## 步骤1: Fork仓库
1. 访问 https://github.com/INFLUX-PG-6/influxdb-nocode-interface
2. 点击右上角的 "Fork" 按钮
3. 选择您的个人GitHub账户
4. 等待Fork完成

## 步骤2: 更新本地仓库
```bash
# 添加个人Fork作为新的远程仓库
git remote add personal https://github.com/YOUR_USERNAME/influxdb-nocode-interface.git

# 推送到个人仓库
git push personal main
```

## 步骤3: 在Vercel中部署
1. 在Vercel中选择您个人账户下的Fork仓库
2. 其他配置保持不变
3. 正常部署

## 步骤4: 同步更新 (可选)
以后如果需要同步组织仓库的更新：
```bash
git pull origin main
git push personal main
```
