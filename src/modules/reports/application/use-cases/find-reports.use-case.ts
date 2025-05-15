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
import { ReportRepository } from '../../domain/ports/report.repository';
import { REPORT_SYMBOLS } from '../../reports.symbols';
import { ReportFilterQuery } from '../dtos/report.filter.query';
import { ReportsPaginatedList } from '../dtos/reports.paginated-list';

export class FindReportsUseCase
  implements UseCase<ReportsPaginatedList, [Limit, Offset, ReportFilterQuery]>
{
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.REPORT_REPOSITORY)
    private readonly repository: ReportRepository,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async run(
    limit?: Limit,
    offset?: Offset,
    where?: ReportFilterQuery,
  ): Promise<ReportsPaginatedList> {
    this.logger.log('Finding reports', {
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
    this.logger.log('Reports found', {
      count: items.length,
      total,
    });
    return new ReportsPaginatedList(items, total.value());
  }

  private mapWhereToFilter(where?: ReportFilterQuery): Filters {
    if (!where) return [];
    const conditions: Filters = [];
    for (const field in where) {
      if (Object.prototype.hasOwnProperty.call(where, field)) {
        const filterValue = where[field];
        if (filterValue) {
          conditions.push(
            new EqualCondition(
              new ConditionField(field),
              new ConditionValue(filterValue.value()),
            ),
          );
        }
      }
    }
    return conditions;
  }
}
