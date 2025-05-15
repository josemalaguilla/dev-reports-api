import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { InvalidArgumentError } from '../../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../../logger/infrastructure/logger.factory';
import { Condition, ConditionPrimitives } from './condition';

export enum LogicalOperators {
  AND = '&',
  OR = '||',
}

export interface LogicalConditionPrimitives {
  logicalOperator: LogicalOperators;
  conditions: Array<ConditionPrimitives | LogicalConditionPrimitives>;
}

export abstract class LogicalCondition implements Printable {
  private readonly logger: Logger;
  abstract logicalOperator: LogicalOperators;

  constructor(readonly conditions: Array<Condition | LogicalCondition>) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureConditionsAreValid(conditions);
    this.logger.debug(`Created logical condition`, {
      conditionsCount: conditions.length,
    });
  }

  private ensureConditionsAreValid(
    conditions: Array<Condition | LogicalCondition>,
  ): void {
    if (!conditions) {
      this.logger.error('Conditions are not defined', { conditions });
      throw new InvalidArgumentError(
        `Conditions should be defined. Received ${conditions}`,
      );
    }
  }

  public hasConditions(): boolean {
    const hasConditions = this.conditions.length > 0;
    this.logger.verbose(`Checking if logical condition has conditions`, {
      hasConditions,
    });
    return hasConditions;
  }

  public toPrimitives(): LogicalConditionPrimitives {
    return {
      logicalOperator: this.logicalOperator,
      conditions: this.conditions.map((condition) =>
        condition.toPrimitives?.(),
      ),
    };
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
