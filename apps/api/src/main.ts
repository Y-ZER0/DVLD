import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Boots the API on PORT (default 4000): wires the global validation pipe
// (invariant #14), the uniform error filter, the /api prefix, and CORS
// restricted to the configured frontend origin.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // STEP 1: Serve every route under /api so the frontend talks to one
  //         origin-consistent prefix, matching the documented routes
  //         (e.g. POST /api/auth/login).
  app.setGlobalPrefix('api');

  // STEP 2: Global validation pipe — whitelist strips unknown fields and
  //         forbidNonWhitelisted rejects them. This is what makes DTO
  //         decorators and @ParseIntPipe authoritative on every route.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // STEP 3: Central error filter so every thrown exception leaves the API
  //         in the standard { success, statusCode, message, path, timestamp }
  //         shape (code-standards.md § 4) — never a raw stack trace.
  app.useGlobalFilters(new AllExceptionsFilter());

  // STEP 4: CORS restricted to the frontend origin from env — the browser
  //         must be able to call the API with credentials/tokens attached.
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(config.get<string>('PORT') ?? 4000);
}
bootstrap();