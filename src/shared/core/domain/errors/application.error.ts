import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';

export class ApplicationError extends Error {
  protected readonly logger: Logger;

  constructor() {
    super();
    this.name = new.target.name;
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.errors)
        .withClassName(this.constructor.name)
        .build(),
    );

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);

    this.logger.error(`${this.name}: ${this.message}`, this.stack);
  }
}
