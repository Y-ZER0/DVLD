import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';

// TypeORM CLI entry point (apps/api/package.json "typeorm" scripts + inv.
// #16): migrations ALWAYS run against the direct URL (port 5432), never the
// pooler — the pooler rejects the SET commands the migration runner emits.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});