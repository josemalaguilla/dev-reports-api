import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './server/app.module';
import { AppConfig } from './server/config';
import { LogsEnabledMatcher } from './shared/logger/domain/services/logs.enabled.matcher';

async function bootstrap() {
  LogsEnabledMatcher.initialize(process.env.LOGGED_CONTEXTS as string);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogLevels(process.env.LOG_LEVEL as LogLevel),
  });
  enableNestedQueryParams(app);
  AppConfig.initialize(app);
  await app.listen(process.env.PORT);
}

/**
 * This setups the extended query parser to tell express that must parse nested query params
 * to allow objects in query be parsed as where[field]=value apart from stringified json query params.
 * @param app App which should be modified
 */
function enableNestedQueryParams(app: NestExpressApplication): void {
  app.set('query parser', 'extended');
}

function getLogLevels(minLevel: LogLevel): LogLevel[] {
  const levels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  return levels.slice(levels.indexOf(minLevel));
}

bootstrap();
