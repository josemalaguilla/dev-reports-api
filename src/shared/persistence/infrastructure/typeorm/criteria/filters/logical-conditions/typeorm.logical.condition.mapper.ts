import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { LogicalCondition } from 'src/shared/persistence/domain/criteria/conditions/logical.condition';
import { WhereExpressionBuilder } from 'typeorm';

export abstract class TypeORMLogicalConditionMapper {
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

  abstract map(
    builder: WhereExpressionBuilder,
    condition: LogicalCondition,
  ): void;
}
