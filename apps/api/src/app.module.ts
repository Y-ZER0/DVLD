import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { LocalLicenseApplicationsModule } from './modules/local-license-applications/local-license-applications.module';
import { LookupModule } from './modules/lookup/lookup.module';
import { PeopleModule } from './modules/people/people.module';
import { TestingModule } from './modules/testing/testing.module';
import { UsersModule } from './modules/users/users.module';

// Root module: loads env globally, then wires TypeORM to Supabase using the
// runtime (pooler) URL. synchronize stays on only outside production —
// schema changes always go through migrations (invariant #17).
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    PeopleModule,
    UsersModule,
    LookupModule,
    LocalLicenseApplicationsModule,
    TestingModule,
    DriversModule,
    LicensesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}