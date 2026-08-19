import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DetainReleaseModule } from './modules/detain-release/detain-release.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { InternationalLicensesModule } from './modules/international-licenses/international-licenses.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { LocalLicenseApplicationsModule } from './modules/local-license-applications/local-license-applications.module';
import { LookupModule } from './modules/lookup/lookup.module';
import { PeopleModule } from './modules/people/people.module';
import { TestingModule } from './modules/testing/testing.module';
import { UsersModule } from './modules/users/users.module';

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
    DetainReleaseModule,
    InternationalLicensesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}