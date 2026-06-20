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
