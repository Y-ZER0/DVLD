import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});