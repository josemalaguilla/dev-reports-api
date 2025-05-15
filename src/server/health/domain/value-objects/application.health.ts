import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ServiceHealth } from '../ports/health-indicator';

declare type HealthCheckStatus = 'error' | 'ok' | 'shutting_down';

export declare interface ApplicationHealthWithPrimitives {
  status: HealthCheckStatus;
  details?: ServiceHealth;
}

export class ApplicationHealth {
  private readonly _status: HealthCheckStatus;
  private readonly _details: ServiceHealth;
  private readonly logger: Logger;

  constructor(status: HealthCheckStatus, details?: ServiceHealth) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.health)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureStatusIsValid(status);
    this._status = status;
    this._details = details;
    this.logger.debug('Created application health status', {
      status,
      details,
    });
  }

  private ensureStatusIsValid(status: HealthCheckStatus) {
    const validStatuses = ['error', 'ok', 'shutting_down'];
    if (!validStatuses.includes(status)) {
      this.logger.error('Invalid health status', { status });
      throw new InvalidArgumentError(
        `Health status is invalid cannot be ${status}`,
      );
    }
  }

  public toPrimitives(): ApplicationHealthWithPrimitives {
    return {
      status: this._status,
      details: this._details,
    };
  }
}
