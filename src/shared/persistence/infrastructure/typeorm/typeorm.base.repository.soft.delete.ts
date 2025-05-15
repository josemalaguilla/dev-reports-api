import { AggregateRoot } from '../../../core/domain/entities/aggregate.root';
import { TypeORMBaseRepository } from './typeorm.base.repository';

export abstract class TypeORMBaseRepositoryWithSoftDelete<
  Entity extends AggregateRoot,
  TypeORMEntity,
> extends TypeORMBaseRepository<Entity, TypeORMEntity> {
  async delete(entity: Entity): Promise<void> {
    this.logger.debug('Soft deleting entity', { entityId: entity.getId() });
    await this.repository.softDelete(entity.getId());
  }
}
