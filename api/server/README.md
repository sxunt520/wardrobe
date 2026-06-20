# 衣橱管家后端

NestJS + MySQL + Redis 后端，包含 APP 接口、管理后台接口、腾讯云 COS 上传和阿里云 DashScope AI 能力。

## 本地开发

```bash
cp .env.example .env
npm install
# 新数据库先导入 db/init.sql
npm run migration:run
npm run start:dev
```

开发配置读取 `src/config/dev.yml`，密钥和数据库连接优先读取 `.env`。开发环境同样关闭了 `synchronize` 与 SQL 全量日志。`.env` 已加入 Git 忽略，不要把真实密钥提交到仓库。

常用命令：

```bash
npm run build
npm test
npm run test:cov
npm run migration:show
npm run migration:run
npm run migration:revert
```

## 生产部署

1. 从 `.env.example` 创建 `.env`，填写 MySQL、Redis、JWT、COS 和 DashScope 配置。
2. `JWT_SECRET` 必须至少 32 个字符。
3. 生产配置固定关闭 `synchronize` 和 SQL 日志。
4. 容器启动时会先执行 TypeORM migration，再启动 API。

```bash
docker compose up -d --build
docker compose logs -f api
```

首次启动时 MySQL 会执行 `db/init.sql`。后续结构变更必须新增 migration，不要修改线上库后依赖 `synchronize`。

默认不公开 Swagger。需要临时开启时设置：

```bash
ENABLE_SWAGGER=true
```

## AI 行为

生产环境 `AI_ALLOW_FALLBACK=false`。DashScope Key 缺失或请求失败会返回明确错误并写入 AI 调用日志，不会静默伪造结果。开发环境如需离线调试，可显式设置：

```bash
AI_ALLOW_FALLBACK=true
```

## 限流

服务包含四档限流：全局、登录注册、图片上传、AI 生成。阈值可通过 `.env` 中的 `RATE_LIMIT_*` 调整。

## 发布前检查

```bash
npm run build
npm test
npm run migration:show
NODE_ENV=production node dist/main
```

最后一条命令应在缺少生产变量时主动失败；配置完整后才允许启动。
