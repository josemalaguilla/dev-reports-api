import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { WhereExpressionBuilder } from 'typeorm';
import { Logger } from '../../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../../logger/infrastructure/logger.factory';
import { Condition } from '../../../domain/criteria/conditions/condition';
import { AndCondition } from '../../../domain/criteria/conditions/logical-conditions/and.condition';
import { LogicalCondition } from '../../../domain/criteria/conditions/logical.condition';
import { Filters } from '../../../domain/criteria/criteria';
import { TypeORMLogicalConditionMapperFactory } from './filters/logical-conditions/typeorm.logical.condition.mapper.factory';

export class TypeORMFilterMapper {
  private readonly logger: Logger;

  constructor() {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public map(builder: WhereExpressionBuilder, filters: Filters): void {
    this.logger.debug('Mapping filters to TypeORM query', {
      filters: Array.isArray(filters)
        ? filters.map((filter) => filter.toPrimitives())
        : filters.toPrimitives(),
    });

    if (!this.isLogicalCondition(filters)) {
      filters = new AndCondition(filters as Condition[]);
    }

    const parser = TypeORMLogicalConditionMapperFactory.create(
      filters as LogicalCondition,
    );
    parser.map(builder, filters as LogicalCondition);
  }

  private isLogicalCondition(filters: Filters): boolean {
    return !Array.isArray(filters);
  }
}
