import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mw as requestIpMw } from 'request-ip';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HttpExceptionsFilter } from 'src/common/filters/http-exceptions-filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // 开启跨域访问
  });
  const config = app.get(ConfigService);
  // 设置 api 访问前缀
  const prefix = config.get<string>('app.prefix');
  app.set('trust proxy', 1);
  const createLimiter = (name: string) =>
    rateLimit({
      windowMs: config.get<number>(`rateLimit.${name}.windowMs`),
      max: config.get<number>(`rateLimit.${name}.max`),
      standardHeaders: true,
      legacyHeaders: false,
      message: { code: 429, msg: '请求过于频繁，请稍后再试', data: null },
    });
  app.use(createLimiter('global'));
  const aiLimiter = createLimiter('ai');
  app.use(`${prefix}/login`, createLimiter('login'));
  app.use(`${prefix}/register`, createLimiter('login'));
  app.use(`${prefix}/common/upload`, createLimiter('upload'));
  app.use(`${prefix}/app/wardrobe/ai`, aiLimiter);
  app.use(`${prefix}/app/wardrobe/outfits/generate`, aiLimiter);
  app.use(`${prefix}/app/wardrobe/outfits`, (req, res, next) => {
    if (req.path.endsWith('/try-on') || req.path.endsWith('/render')) return aiLimiter(req, res, next);
    next();
  });

  const rootPath = process.cwd();
  const baseDirPath = path.posix.join(rootPath, config.get('app.file.location'));
  app.useStaticAssets(baseDirPath, {
    prefix: '/profile/',
    maxAge: 86400000 * 365,
  });

  app.useStaticAssets('public', {
    prefix: '/public/',
    maxAge: 0,
  });

  app.setGlobalPrefix(prefix);
  // 全局验证
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionsFilter());

  // web 安全，防常见漏洞
  // 注意： 开发环境如果开启 nest static module 需要将 crossOriginResourcePolicy 设置为 false 否则 静态资源 跨域不可访问
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false, // 放开 CSP 限制
    }),
  );
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest-Admin')
    .setDescription('Nest-Admin 接口文档')
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header', // 认证信息放置的位置
        name: 'Authorization', // 显式指定请求头名称
        description: '请在请求头中携带 JWT 令牌，格式：Bearer <token>',
      },
      'Authorization',
    )
    .addServer(config.get<string>('app.file.domain'))
    .build();

  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const document = SwaggerModule.createDocument(app, swaggerOptions);
    writeFileSync(path.posix.join(process.cwd(), 'public', 'openApi.json'), JSON.stringify(document, null, 2));
    SwaggerModule.setup(`${prefix}/swagger-ui`, app, document, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'Nest-Admin API Docs',
    });
  }

  // 获取真实 ip
  app.use(requestIpMw({ attributeName: 'ip' }));
  //服务端口
  const port = config.get<number>('app.port') || 8080;
  await app.listen(port);

  console.log(`Nest-Admin 服务启动成功`, '\n', '服务地址', `http://localhost:${port}${prefix}/`, '\n', 'swagger 文档地址', `http://localhost:${port}${prefix}/swagger-ui/`);
}
bootstrap();
