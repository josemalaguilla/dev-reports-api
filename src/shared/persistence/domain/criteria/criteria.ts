import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { InvalidArgumentError } from '../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { Condition, ConditionPrimitives } from './conditions/condition';
import {
  LogicalCondition,
  LogicalConditionPrimitives,
} from './conditions/logical.condition';
import { Limit } from './limit';
import { Offset } from './offset';
import { Order, OrderPrimitives } from './order';
import { OrderField } from './order.field';
import { OrderType } from './order.type';
import { Pagination, PaginationPrimitives } from './pagination';

export declare type Filters = Condition[] | LogicalCondition;

export interface CriteriaPrimitives {
  filters: ConditionPrimitives[] | LogicalConditionPrimitives;
  order: OrderPrimitives;
  pagination?: PaginationPrimitives;
}

export class Criteria implements Printable {
  private readonly logger: Logger;

  constructor(
    readonly filters: Filters,
    private readonly order: Order,
    private readonly pagination?: Pagination,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureCriteriaIsValid(filters, order);
    this.logger.debug('Created criteria', {
      hasFilters: this.hasFilters(),
      orderBy: order.orderBy,
      orderType: order.orderType,
      hasPagination: this.hasPagination(),
    });
  }

  private ensureCriteriaIsValid(filters: Filters, order: Order) {
    if (!filters) {
      this.logger.error('Filters are missing', { filters });
      throw new InvalidArgumentError(
        `Filters is mandatory on criteria. Found: ${filters}`,
      );
    }

    if (!order) {
      this.logger.error('Order is missing', { order });
      throw new InvalidArgumentError(
        `Order is mandatory on criteria. Found: ${order}`,
      );
    }
  }

  public hasFilters(): boolean {
    const logicalConditionHasFilters =
      this.isLogicalCondition() &&
      (this.filters as LogicalCondition).hasConditions();
    const hasConditions = (this.filters as Condition[]).length > 0;
    this.logger.verbose(`Checking if criteria has filters`, {
      logicalConditionHasFilters,
      hasConditions,
    });
    return logicalConditionHasFilters || hasConditions;
  }

  private isLogicalCondition(): boolean {
    return !Array.isArray(this.filters);
  }

  public hasPagination(): boolean {
    return !!this.pagination?.limit && !!this.pagination?.offset;
  }

  public limit(): Limit {
    return this.pagination.limit;
  }

  public offset(): Offset {
    return this.pagination.offset;
  }

  public orderBy(): OrderField {
    return this.order.orderBy;
  }

  public orderType(): OrderType {
    return this.order.orderType;
  }

  public toPrimitives(): CriteriaPrimitives {
    return {
      filters: Array.isArray(this.filters)
        ? this.filters.map((filter) => filter.toPrimitives())
        : this.filters.toPrimitives(),
      order: this.order.toPrimitives(),
      pagination: this.pagination?.toPrimitives(),
    };
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
