import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { Primitives } from './primitive.value.object';
import { Printable } from './printable';
import { ValueObject } from './value.object';

export abstract class EnumValueObject<T extends Primitives>
  implements ValueObject<T>, Printable
{
  private readonly _value: T;
  protected readonly logger: Logger;

  constructor(
    _value: T,
    private readonly validValues: T[],
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this._value = _value;
    this.checkValueIsValid(_value);
    this.logger.debug(`Created new ${this.constructor.name}`, {
      value: _value,
    });
  }

  private checkValueIsValid(value: T): void {
    if (!this.validValues.includes(value)) {
      this.logger.error(`Invalid enum value`, {
        value,
        validValues: this.validValues?.join(','),
      });
      throw new InvalidArgumentError(
        `The value ${value} is not valid in enum. Only valid ${this.validValues?.join(',')}`,
      );
    }
  }

  public value(): T {
    return this._value;
  }

  public toString(): string {
    return String(this.value());
  }

  public equals(otherValue: EnumValueObject<T>): boolean {
    const isEqual = this._value === otherValue.value();
    this.logger.verbose(`Comparing values`, {
      value: this.value(),
      otherValue: otherValue,
      isEqual,
    });
    return isEqual;
  }
}
