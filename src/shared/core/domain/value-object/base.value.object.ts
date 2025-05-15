import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { Primitives, PrimitiveValueObject } from './primitive.value.object';
import { Printable } from './printable';

export abstract class BaseValueObject<T extends Primitives>
  implements PrimitiveValueObject<T>, Printable
{
  protected readonly _value: T;
  protected readonly logger: Logger;

  constructor(value: T) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this._value = value;
    this.ensureValueIsDefined(value);
    this.logger.debug(`Created new ${this.constructor.name}`, {
      value,
    });
  }

  private ensureValueIsDefined(value: T): void {
    if (value === null || value === undefined) {
      this.logger.error(`Value must be defined`, { value });
      throw new InvalidArgumentError(`Value must be defined. Found: ${value}`);
    }
  }

  public value(): T {
    return this._value;
  }

  public toString(): string {
    return String(this.value());
  }

  public equals(otherValue: BaseValueObject<T>): boolean {
    const isEqual = this._value === otherValue.value();
    this.logger.verbose(`Comparing values`, {
      value: this.value(),
      otherValue: otherValue,
      isEqual,
    });
    return isEqual;
  }
}
