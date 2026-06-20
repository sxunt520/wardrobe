import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV;

export default () => {
  const environment = configFileNameObj[env] ? env : 'development';
  const config = yaml.load(readFileSync(join(__dirname, `./${configFileNameObj[environment]}.yml`), 'utf8')) as Record<string, any>;
  if (process.env.APP_PORT) config.app.port = Number(process.env.APP_PORT);
  if (process.env.APP_PREFIX !== undefined) config.app.prefix = process.env.APP_PREFIX;
  if (process.env.APP_DOMAIN) config.app.file.domain = process.env.APP_DOMAIN;
  if (process.env.FILE_MAX_SIZE_MB) config.app.file.maxSize = Number(process.env.FILE_MAX_SIZE_MB);
  if (process.env.MYSQL_HOST) config.db.mysql.host = process.env.MYSQL_HOST;
  if (process.env.MYSQL_PORT) config.db.mysql.port = Number(process.env.MYSQL_PORT);
  if (process.env.MYSQL_USERNAME) config.db.mysql.username = process.env.MYSQL_USERNAME;
  if (Object.prototype.hasOwnProperty.call(process.env, 'MYSQL_PASSWORD')) config.db.mysql.password = process.env.MYSQL_PASSWORD;
  if (process.env.MYSQL_DATABASE) config.db.mysql.database = process.env.MYSQL_DATABASE;
  if (process.env.REDIS_HOST) config.redis.host = process.env.REDIS_HOST;
  if (process.env.REDIS_PORT) config.redis.port = Number(process.env.REDIS_PORT);
  if (Object.prototype.hasOwnProperty.call(process.env, 'REDIS_PASSWORD')) config.redis.password = process.env.REDIS_PASSWORD;
  if (process.env.REDIS_DB) config.redis.db = Number(process.env.REDIS_DB);
  if (process.env.JWT_SECRET) config.jwt.secretkey = process.env.JWT_SECRET;
  if (process.env.JWT_EXPIRES_IN) config.jwt.expiresin = process.env.JWT_EXPIRES_IN;
  if (process.env.JWT_REFRESH_EXPIRES_IN) config.jwt.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
  if (process.env.DASHSCOPE_API_KEY) config.aliyun.dashscope.apiKey = process.env.DASHSCOPE_API_KEY;
  if (process.env.DASHSCOPE_MODEL) config.aliyun.dashscope.model = process.env.DASHSCOPE_MODEL;
  if (process.env.DASHSCOPE_VISUAL_MODEL) config.aliyun.dashscope.visualModel = process.env.DASHSCOPE_VISUAL_MODEL;
  if (process.env.DASHSCOPE_TRY_ON_MODEL) config.aliyun.dashscope.tryOnModel = process.env.DASHSCOPE_TRY_ON_MODEL;
  if (process.env.COS_SECRET_ID) config.cos.secretId = process.env.COS_SECRET_ID;
  if (process.env.COS_SECRET_KEY) config.cos.secretKey = process.env.COS_SECRET_KEY;
  if (process.env.COS_BUCKET) config.cos.bucket = process.env.COS_BUCKET;
  if (process.env.COS_REGION) config.cos.region = process.env.COS_REGION;
  if (process.env.COS_DOMAIN) config.cos.domain = process.env.COS_DOMAIN;
  if (process.env.COS_LOCATION) config.cos.location = process.env.COS_LOCATION;
  if (process.env.AI_ALLOW_FALLBACK !== undefined) config.aliyun.dashscope.allowFallback = process.env.AI_ALLOW_FALLBACK === 'true';
  if (process.env.RATE_LIMIT_GLOBAL_MAX) config.rateLimit.global.max = Number(process.env.RATE_LIMIT_GLOBAL_MAX);
  if (process.env.RATE_LIMIT_LOGIN_MAX) config.rateLimit.login.max = Number(process.env.RATE_LIMIT_LOGIN_MAX);
  if (process.env.RATE_LIMIT_UPLOAD_MAX) config.rateLimit.upload.max = Number(process.env.RATE_LIMIT_UPLOAD_MAX);
  if (process.env.RATE_LIMIT_AI_MAX) config.rateLimit.ai.max = Number(process.env.RATE_LIMIT_AI_MAX);
  validateConfiguration(config, environment);
  return config;
};

function validateConfiguration(config: Record<string, any>, environment: string) {
  if (environment !== 'production') return;
  const required = [
    ['MYSQL_HOST', config.db?.mysql?.host],
    ['MYSQL_USERNAME', config.db?.mysql?.username],
    ['MYSQL_DATABASE', config.db?.mysql?.database],
    ['REDIS_HOST', config.redis?.host],
    ['JWT_SECRET', config.jwt?.secretkey],
    ['COS_SECRET_ID', config.cos?.secretId],
    ['COS_SECRET_KEY', config.cos?.secretKey],
    ['COS_BUCKET', config.cos?.bucket],
    ['DASHSCOPE_API_KEY', config.aliyun?.dashscope?.apiKey],
  ];
  const missing = required.filter(([, value]) => !value || value === 'you_secretkey').map(([name]) => name);
  if (missing.length) {
    throw new Error(`生产环境缺少必要配置: ${missing.join(', ')}`);
  }
  if (String(config.jwt.secretkey).length < 32) {
    throw new Error('JWT_SECRET 至少需要 32 个字符');
  }
}
