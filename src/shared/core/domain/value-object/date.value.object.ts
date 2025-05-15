import * as moment from 'moment-timezone';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { PrimitiveValueObject } from './primitive.value.object';
import { Printable } from './printable';

export type DateString = string;

export class DateValueObject
  implements PrimitiveValueObject<DateString>, Printable
{
  private readonly _value: moment.Moment;
  private readonly logger: Logger;

  constructor(value: string) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureValueIsDefined(value);
    this.ensureDateIsValid(value);
    this._value = moment.utc(value, moment.ISO_8601, true);
    this.logger.debug(`Created new DateValueObject`, {
      value,
    });
  }

  public static now(): DateValueObject {
    return new DateValueObject(new Date().toISOString());
  }

  private ensureValueIsDefined(value: string): void {
    if (!value) {
      this.logger.error(`Date must be defined`, { value });
      throw new InvalidArgumentError(`Date must be defined. Found: ${value}`);
    }
  }

  private ensureDateIsValid(date: string): void {
    const validDate = moment.utc(date, moment.ISO_8601, true);
    if (!validDate.isValid()) {
      this.logger.error(`Invalid date`, { date: date });
      throw new InvalidArgumentError(`Invalid date ${date}`);
    }
  }

  public value(): string {
    return this._value.toISOString();
  }

  public toString(): string {
    return this.value();
  }

  public date(): moment.Moment {
    return this._value;
  }

  public equals(otherDate: DateValueObject): boolean {
    const isEqual = this.value() === otherDate.value();
    this.logger.verbose(`Comparing dates`, {
      value: this.value(),
      otherValue: otherDate,
      isEqual,
    });
    return isEqual;
  }

  public isBefore(otherDate: DateValueObject): boolean {
    return this._value.isBefore(otherDate.date());
  }

  public isAfter(otherDate: DateValueObject): boolean {
    return this._value.isAfter(otherDate.date());
  }
}
