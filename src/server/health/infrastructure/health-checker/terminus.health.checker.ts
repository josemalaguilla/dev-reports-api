import { Inject } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { HealthChecker } from '../../domain/ports/health-checker';
import { HealthIndicator } from '../../domain/ports/health-indicator';
import { ApplicationHealth } from '../../domain/value-objects/application.health';

export class TerminusHealthChecker implements HealthChecker {
  private readonly logger: Logger;

  constructor(@Inject(HealthCheckService) private health: HealthCheckService) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.health)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async check(
    indicators: HealthIndicator[],
  ): Promise<ApplicationHealth> {
    this.logger.debug('Running health check', {
      indicatorsCount: indicators.length,
    });

    const healthResult = await this.getHealth(indicators);

    this.logger.debug('Health check completed', {
      status: healthResult.status,
    });

    return new ApplicationHealth(healthResult.status, healthResult.details);
  }

  private getHealth(indicators: HealthIndicator[]): Promise<HealthCheckResult> {
    return this.health.check(
      indicators.map((indicator) => {
        return () => indicator.check();
      }),
    );
  }
}
