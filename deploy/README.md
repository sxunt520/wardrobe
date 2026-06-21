# 服务器连接配置

请填写 `server.env`：

```env
SSH_HOST=服务器公网IP
SSH_PORT=22
SSH_USER=root
SSH_AUTH_METHOD=password
SSH_PASSWORD=服务器登录密码
SSH_PRIVATE_KEY=
REMOTE_PROJECT_DIR=/opt/wardrobe
API_DOMAIN=api.example.com
SSL_EMAIL=你的证书通知邮箱
```

使用私钥登录时改为：

```env
SSH_AUTH_METHOD=private_key
SSH_PASSWORD=
SSH_PRIVATE_KEY=/Users/sxunt/.ssh/你的私钥文件
```

`server.env` 和私钥文件均已被 Git 忽略。不要把服务器密码或私钥内容写进聊天、源码或示例文件。

填写完成后，可先验证连接：

```bash
source deploy/server.env
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST"
```

## 当前后端部署

- 服务器目录：`/data/wardrobe/api`
- 公网 API：`http://139.155.127.129/wardrobe-api`
- 管理后台：`http://139.155.127.129:181`
- 管理后台静态目录：`/var/www/wardrobe-admin`
- NestJS：仅监听服务器本机 `127.0.0.1:8080`
- MySQL、Redis：仅在 Docker 内部网络访问
- Nginx 配置：`/etc/nginx/sites-available/wardrobe-api`
- 管理后台 Nginx 配置：`/etc/nginx/sites-available/wardrobe-admin`

服务器常用命令：

```bash
cd /data/wardrobe/api
docker compose ps
docker compose logs -f api
docker compose restart api
docker compose exec -T api npx typeorm -d dist/database/data-source.js migration:show
```

生产管理账号保存在本机 `deploy/admin.env`，不要提交或发送该文件。

如需临时公网连接 MySQL，将服务器 `.env` 中的 `MYSQL_PUBLIC_BIND`
设为 `0.0.0.0`，并同时在腾讯云防火墙和服务器 `DOCKER-USER`
链中仅放行可信公网 IP。禁止使用 `0.0.0.0/0` 放行数据库端口。
