import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { ObjectLiteral, Repository as TypeORMRepository } from 'typeorm';
import { AggregateRoot } from '../../../core/domain/entities/aggregate.root';
import { Nullable } from '../../../core/domain/nullable';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { Criteria, Filters } from '../../domain/criteria/criteria';
import { Repository } from '../../domain/repository';
import { CountResult } from '../../domain/responses/count.result';
import { TypeORMCriteriaMapper } from './criteria/typeorm.criteria.mapper';
import { TypeORMFilterMapper } from './criteria/typeorm.filter.mapper';

export abstract class TypeORMBaseRepository<
  Entity extends AggregateRoot,
  TypeORMEntity extends ObjectLiteral,
> implements Repository<Entity>
{
  protected readonly logger: Logger;
  protected readonly criteriaMapper: TypeORMCriteriaMapper;
  protected readonly filtersMapper: TypeORMFilterMapper;

  constructor(protected repository: TypeORMRepository<TypeORMEntity>) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.criteriaMapper = new TypeORMCriteriaMapper();
    this.filtersMapper = new TypeORMFilterMapper();
  }

  abstract parseDBToEntity(databaseEntity: TypeORMEntity): Entity;

  protected parseEntityToDB(entity: Entity): TypeORMEntity {
    return entity.toPrimitives();
  }

  public async find(criteria: Criteria): Promise<Entity[]> {
    this.logger.debug('Finding entities with criteria', {
      criteria: criteria.toPrimitives(),
    });
    const queryBuilder = this.repository.createQueryBuilder().select();
    this.criteriaMapper.map(queryBuilder, criteria);
    this.logger.debug('Finding entities with criteria', {
      query: queryBuilder.getSql(),
    });
    const instances = await queryBuilder.getMany();
    return instances.map((instance) => this.parseDBToEntity(instance));
  }

  public async findOne(filters: Filters): Promise<Nullable<Entity>> {
    this.logger.debug('Finding one entity with filters', {
      filters: Array.isArray(filters)
        ? filters.map((filter) => filter.toPrimitives())
        : filters.toPrimitives(),
    });
    const queryBuilder = this.repository.createQueryBuilder().select();
    this.filtersMapper.map(queryBuilder, filters);
    this.logger.debug('Finding one entity with filters', {
      query: queryBuilder.getSql(),
    });
    const instance = await queryBuilder.getOne();
    return instance && this.parseDBToEntity(instance);
  }

  public async count(filters: Filters): Promise<CountResult> {
    this.logger.debug('Counting entities with filters', {
      filters: Array.isArray(filters)
        ? filters.map((filter) => filter.toPrimitives())
        : filters.toPrimitives(),
    });
    const queryBuilder = this.repository.createQueryBuilder().select();
    this.filtersMapper.map(queryBuilder, filters);
    this.logger.debug('Counting entities with filters', {
      query: queryBuilder.getSql(),
    });
    return new CountResult(await queryBuilder.getCount());
  }

  public async delete(entity: Entity): Promise<void> {
    this.logger.debug('Deleting entity', { entityId: entity.getId() });
    await this.repository.delete(entity.getId());
  }

  public async save(entity: Entity): Promise<void> {
    this.logger.debug('Saving entity', { entityId: entity.getId() });
    await this.repository.save(this.parseEntityToDB(entity));
  }
}
