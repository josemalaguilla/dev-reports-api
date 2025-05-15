import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

export class AppConfig {
  public static initialize(app: NestExpressApplication): void {
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );
  }
}
