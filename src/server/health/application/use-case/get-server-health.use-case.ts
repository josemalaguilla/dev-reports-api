import { Inject, Injectable } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { UseCase } from '../../../../shared/core/domain/use-cases/base.use-case';
import { Logger } from '../../../../shared/logger/domain/ports/logger';
import { LoggerFactory } from '../../../../shared/logger/infrastructure/logger.factory';
import { HealthChecker } from '../../domain/ports/health-checker';
import { HealthIndicator } from '../../domain/ports/health-indicator';
import { ApplicationHealthWithPrimitives } from '../../domain/value-objects/application.health';
import { HEALTH_SYMBOLS } from '../../health.symbols';

@Injectable()
export class GetServerHealthUseCase
  implements UseCase<ApplicationHealthWithPrimitives, [void]>
{
  private readonly logger: Logger;

  constructor(
    @Inject(HEALTH_SYMBOLS.HEALTH_CHECKER)
    private healthChecker: HealthChecker,
    @Inject(HEALTH_SYMBOLS.MAIN_DATABASE_HEALTH_INDICATOR)
    private databaseHealthIndicator: HealthIndicator,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.health)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async run(): Promise<ApplicationHealthWithPrimitives> {
    this.logger.debug('Checking server health');
    const health = await this.healthChecker.check([
      this.databaseHealthIndicator,
    ]);
    this.logger.debug('Server health check completed', {
      status: health.toPrimitives().status,
    });
    return health.toPrimitives();
  }
}
