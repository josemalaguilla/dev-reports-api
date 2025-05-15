import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeORMBaseRepository } from '../../../../src/shared/persistence/infrastructure/typeorm/typeorm.base.repository';
import { TypeORMMockEntity } from './typeorm.mock-entity';
import { TypeORMMockAggregateRoot } from './typeorm.mock.aggregate.root';

export class TypeORMMockRepository extends TypeORMBaseRepository<
  TypeORMMockAggregateRoot,
  TypeORMMockEntity
> {
  constructor(
    @InjectRepository(TypeORMMockEntity)
    repository: Repository<TypeORMMockEntity>,
  ) {
    super(repository);
  }

  public parseDBToEntity(
    databaseEntity: TypeORMMockEntity,
  ): TypeORMMockAggregateRoot {
    this.logger.verbose('Parsing database entity', {
      databaseEntity,
    });
    return TypeORMMockAggregateRoot.fromPrimitives(databaseEntity);
  }
}
