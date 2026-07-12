# 衣橱管家微信小程序

第一版定位：轻量体验版和分享入口，复用 NestJS 后端与腾讯云 COS 上传链路。

## 功能

- 微信小程序登录，后端换取 JWT
- 首页灵感、快速上传、快速生成搭配
- 拍照或相册选择衣物
- 上传到 `/common/upload`，返回腾讯云 COS 图片地址
- 调用 `/app/wardrobe/ai/analyze-clothing` 识别衣物
- 保存衣物到 `/app/wardrobe/clothing`
- 衣橱分类筛选和删除
- AI 生成搭配和搭配历史
- 我的页面展示衣物/搭配数量

## 本地启动

```bash
cd /Users/sxunt/Downloads/expo/wardrobe/miniprogram
npm install
npm run dev:weapp
```

然后用微信开发者工具打开：

```text
/Users/sxunt/Downloads/expo/wardrobe/miniprogram
```

小程序源码会编译到：

```text
/Users/sxunt/Downloads/expo/wardrobe/miniprogram/dist
```

## 接口地址

默认接口：

```text
http://139.155.127.129/wardrobe-api
```

如需改成本地或其它环境：

```bash
TARO_APP_API_BASE_URL=http://你的地址 npm run dev:weapp
```

## 后端配置

后端新增接口：

```text
POST /app/auth/wechat-login
```

需要在后端环境变量中配置微信小程序：

```env
WECHAT_MINI_APPID=你的小程序appid
WECHAT_MINI_SECRET=你的小程序secret
```

线上还需要重新构建并部署后端。

## 微信后台域名

正式小程序需要在微信公众平台配置 request/uploadFile 合法域名。

如果继续用当前 HTTP IP 地址，微信正式环境会受限；建议后续给后端配置域名和 HTTPS，例如：

```text
https://api.your-domain.com
```

并在微信后台添加：

```text
request 合法域名：https://api.your-domain.com
uploadFile 合法域名：https://api.your-domain.com
downloadFile 合法域名：https://你的 COS 域名
```

开发阶段可在微信开发者工具中勾选“不校验合法域名、web-view、TLS 版本以及 HTTPS 证书”。

## 构建

```bash
npm run typecheck
npm run build:weapp
```
