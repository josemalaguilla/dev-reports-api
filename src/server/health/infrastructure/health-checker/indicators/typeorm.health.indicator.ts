import { Inject } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  HealthIndicator,
  ServiceHealth,
} from 'src/server/health/domain/ports/health-indicator';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';

export class TypeORMHealthIndicator implements HealthIndicator {
  private readonly logger: Logger;

  constructor(
    @Inject(TypeOrmHealthIndicator)
    private databaseIndicator: TypeOrmHealthIndicator,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.health)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async check(): Promise<ServiceHealth> {
    this.logger.debug('Checking database health');
    const health = await this.databaseIndicator.pingCheck('database');
    this.logger.debug('Database health check completed', { health });
    return health;
  }
}
