import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeORMBaseRepositoryWithSoftDelete } from '../../../../../../shared/persistence/infrastructure/typeorm/typeorm.base.repository.soft.delete';
import { Developer } from '../../../../domain/entities/developer';
import { DeveloperRepository } from '../../../../domain/ports/developer.repository';
import { TypeORMDeveloperEntity } from '../entities/typeorm.developer.entity';

export class TypeORMDeveloperRepository
  extends TypeORMBaseRepositoryWithSoftDelete<Developer, TypeORMDeveloperEntity>
  implements DeveloperRepository
{
  constructor(
    @InjectRepository(TypeORMDeveloperEntity)
    repository: Repository<TypeORMDeveloperEntity>,
  ) {
    super(repository);
  }

  public parseDBToEntity(databaseEntity: TypeORMDeveloperEntity): Developer {
    this.logger.verbose('Parsing database entity', {
      databaseEntity,
    });
    return Developer.fromPrimitives(databaseEntity);
  }
}
