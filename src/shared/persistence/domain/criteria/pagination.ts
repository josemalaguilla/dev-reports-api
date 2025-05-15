import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { InvalidArgumentError } from '../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../logger/domain/ports/logger';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { Limit } from './limit';
import { Offset } from './offset';

export interface PaginationPrimitives {
  limit: number;
  offset: number;
}

export class Pagination implements Printable {
  private readonly logger: Logger;

  constructor(
    readonly limit: Limit,
    readonly offset: Offset,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureIsValid(limit, offset);
    this.logger.debug('Created pagination', {
      limit,
      offset,
    });
  }

  private ensureIsValid(limit: Limit, offset: Offset): void {
    if (!limit) {
      this.logger.error('Limit is missing', { limit });
      throw new InvalidArgumentError(
        `Limit is required on pagination. Found ${limit}`,
      );
    }

    if (!offset) {
      this.logger.error('Offset is missing', { offset });
      throw new InvalidArgumentError(
        `Offset is required on pagination. Found ${offset}`,
      );
    }
  }

  public toPrimitives(): PaginationPrimitives {
    return {
      limit: this.limit.value(),
      offset: this.offset.value(),
    };
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
