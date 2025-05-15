import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import {
  ReportErrorMessage,
  ReportErrorMessageWithPrimitives,
} from './report.error.message';

export declare type ReportErrorMessagesWithPrimitives =
  ReportErrorMessageWithPrimitives[];

export class ReportErrorMessages implements Printable {
  protected readonly _value: ReportErrorMessage[];
  protected readonly logger: Logger;

  constructor(value: ReportErrorMessageWithPrimitives[]) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this._value = value.map((item) => new ReportErrorMessage(item));
    this.ensureValueIsDefined(value);
    this.logger.debug(`Created new ${this.constructor.name}`, {
      value,
    });
  }

  private ensureValueIsDefined(
    value: ReportErrorMessageWithPrimitives[],
  ): void {
    if (value === null || value === undefined) {
      this.logger.error(`Value must be defined`, { value });
      throw new InvalidArgumentError(`Value must be defined. Found: ${value}`);
    }
  }

  public value(): ReportErrorMessagesWithPrimitives {
    return this._value.map((item) => item.value());
  }

  public toString(): string {
    return this.value().join(', ');
  }

  public hasItem(errorMessage: ReportErrorMessage): boolean {
    return this._value.findIndex((error) => error.equals(errorMessage)) !== -1;
  }

  public addItem(errorMessage: ReportErrorMessage): void {
    this._value.push(errorMessage);
  }

  public equals(otherValue: ReportErrorMessages): boolean {
    this.logger.verbose(`Comparing values`, {
      value: this.value(),
      otherValue: otherValue,
    });
    if (this._value.length !== otherValue.value().length) return false;
    for (const item of this._value) {
      if (!otherValue.hasItem(item)) return false;
    }
    return true;
  }
}
