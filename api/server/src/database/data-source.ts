import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'nest-admin',
  charset: 'utf8mb4',
  entities: [],
  migrations: [__filename.endsWith('.js') ? 'dist/database/migrations/*.js' : 'src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
