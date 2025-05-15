import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { SelectQueryBuilder } from 'typeorm';
import { Logger } from '../../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../../logger/infrastructure/logger.factory';
import { Criteria } from '../../../domain/criteria/criteria';
import { TypeORMFilterMapper } from './typeorm.filter.mapper';

export class TypeORMCriteriaMapper {
  private readonly filtersMapper: TypeORMFilterMapper;
  private readonly logger: Logger;

  constructor() {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.filtersMapper = new TypeORMFilterMapper();
  }

  public map<Entity>(
    builder: SelectQueryBuilder<Entity>,
    criteria: Criteria,
  ): void {
    this.logger.debug('Mapping criteria to TypeORM query', {
      criteria: criteria.toPrimitives(),
    });

    if (criteria.hasFilters()) {
      this.filtersMapper.map(builder, criteria.filters);
    }

    if (criteria.hasPagination()) {
      builder.skip(criteria.offset().value());
      builder.take(criteria.limit().value());
    }

    builder.orderBy(
      criteria.orderBy().value(),
      criteria.orderType().isAsc() ? 'ASC' : 'DESC',
    );
  }
}
