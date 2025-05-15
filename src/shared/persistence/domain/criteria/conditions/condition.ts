import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Primitives } from 'src/shared/core/domain/value-object/primitive.value.object';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { InvalidArgumentError } from '../../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../../logger/infrastructure/logger.factory';
import { ConditionField } from './condition.field';
import { ConditionIdentifier } from './condition.identifier';
import { ConditionOperator } from './condition.operator';
import { ConditionValue } from './condition.value';

export interface ConditionPrimitives {
  field: string;
  value: Primitives | Primitives[];
  operator: string;
  identifier: string;
}

export abstract class Condition implements Printable {
  private readonly logger: Logger;
  readonly identifier: ConditionIdentifier;
  abstract readonly operator: ConditionOperator;

  constructor(
    readonly field: ConditionField,
    readonly value: ConditionValue | ConditionValue[],
    identifier?: ConditionIdentifier,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureConditionIsGiven(field, value);
    this.identifier = identifier || ConditionIdentifier.fromField(field);
    this.logger.debug('Created condition', {
      field: field,
      value: Array.isArray(value)
        ? value.map((v) => v.value())
        : value?.value(),
      identifier: this.identifier,
    });
  }

  private ensureConditionIsGiven(
    field: ConditionField,
    value: ConditionValue | ConditionValue[],
  ) {
    if (!field) {
      this.logger.error('Field for condition is missing', { field });
      throw new InvalidArgumentError(
        `Field for condition is missing. Found ${field}`,
      );
    }

    if (!value) {
      this.logger.error('Value for condition is missing', { value });
      throw new InvalidArgumentError(
        `Value for condition is missing. Found ${value}`,
      );
    }
  }

  public toPrimitives(): ConditionPrimitives {
    return {
      field: this.field.value(),
      value: Array.isArray(this.value)
        ? this.value.map((v) => v.value())
        : this.value.value(),
      operator: this.operator.value(),
      identifier: this.identifier.value(),
    };
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
