import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Primitives } from 'src/shared/core/domain/value-object/primitive.value.object';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { Condition } from '../../../../../domain/criteria/conditions/condition';

declare type ConditionWhereExpression = string;
declare type ConditionParameters = Record<string, Primitives | Primitives[]>;
export declare type TypeORMConditionMapperResult = {
  where: ConditionWhereExpression;
  parameters: ConditionParameters;
};

export abstract class TypeORMConditionMapper {
  protected readonly logger: Logger;

  constructor() {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  abstract map(condition: Condition): TypeORMConditionMapperResult;
}
