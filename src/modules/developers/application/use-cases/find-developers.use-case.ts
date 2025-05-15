import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import {
  Criteria,
  Filters,
} from 'src/shared/persistence/domain/criteria/criteria';
import { Limit } from 'src/shared/persistence/domain/criteria/limit';
import { Offset } from 'src/shared/persistence/domain/criteria/offset';
import { Order } from 'src/shared/persistence/domain/criteria/order';
import { OrderField } from 'src/shared/persistence/domain/criteria/order.field';
import { OrderType } from 'src/shared/persistence/domain/criteria/order.type';
import { Pagination } from 'src/shared/persistence/domain/criteria/pagination';
import { UseCase } from '../../../../shared/core/domain/use-cases/base.use-case';
import { DEVELOPER_SYMBOLS } from '../../developers.symbols';
import { DeveloperRepository } from '../../domain/ports/developer.repository';
import {
  DeveloperFilterQuery,
  DeveloperFiltrableFields,
} from '../dtos/developer.filter.query';
import { DevelopersPaginatedList } from '../dtos/developers.paginated-list';

export class FindDevelopersUseCase
  implements
    UseCase<DevelopersPaginatedList, [Limit, Offset, DeveloperFilterQuery]>
{
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.DEVELOPER_REPOSITORY)
    private readonly repository: DeveloperRepository,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async run(
    limit?: Limit,
    offset?: Offset,
    where?: DeveloperFilterQuery,
  ): Promise<DevelopersPaginatedList> {
    this.logger.log('Finding developers', {
      limit,
      offset,
      filters: where?.toPrimitives(),
    });
    const filter = this.mapWhereToFilter(where);
    const criteria = new Criteria(
      filter,
      new Order(new OrderField('id'), OrderType.asc()),
      new Pagination(
        limit ? limit : Limit.default(),
        offset ? offset : Offset.zero(),
      ),
    );
    const [items, total] = await Promise.all([
      this.repository.find(criteria),
      this.repository.count(filter),
    ]);
    this.logger.log('Developers found', {
      count: items.length,
      total,
    });
    return new DevelopersPaginatedList(items, total.value());
  }

  private mapWhereToFilter(where: DeveloperFilterQuery): Filters {
    if (!where) return [];
    const conditions: Filters = [];
    for (const fieldName of DeveloperFiltrableFields) {
      const fieldValue = where[fieldName];
      if (fieldValue) {
        conditions.push(
          new EqualCondition(
            new ConditionField(fieldName),
            new ConditionValue(fieldValue.value()),
          ),
        );
      }
    }
    return conditions;
  }
}
