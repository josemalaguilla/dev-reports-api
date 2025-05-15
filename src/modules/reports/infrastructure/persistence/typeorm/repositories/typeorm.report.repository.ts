import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeORMBaseRepositoryWithSoftDelete } from '../../../../../../shared/persistence/infrastructure/typeorm/typeorm.base.repository.soft.delete';
import { Report } from '../../../../domain/entities/report';
import { ReportRepository } from '../../../../domain/ports/report.repository';
import { TypeORMReportEntity } from '../entities/typeorm.report.entity';

export class TypeORMReportRepository
  extends TypeORMBaseRepositoryWithSoftDelete<Report, TypeORMReportEntity>
  implements ReportRepository
{
  constructor(
    @InjectRepository(TypeORMReportEntity)
    repository: Repository<TypeORMReportEntity>,
  ) {
    super(repository);
  }

  public parseDBToEntity(databaseEntity: TypeORMReportEntity): Report {
    this.logger.verbose('Parsing database entity', {
      databaseEntity,
    });

    const reportWithPrimitives = {
      ...databaseEntity,
      targetId: {
        developerId: databaseEntity.developerId,
      },
      errorMessages: databaseEntity.errorMessages?.split(','),
    };
    delete reportWithPrimitives.developerId;
    return Report.fromPrimitives(reportWithPrimitives);
  }

  protected parseEntityToDB(entity: Report): TypeORMReportEntity {
    const primitives = entity.toPrimitives();
    const entityToSave = {
      ...primitives,
      developerId: primitives.targetId.developerId,
      errorMessages: primitives.errorMessages?.join(','),
    };
    delete entityToSave.targetId;
    return entityToSave;
  }
}
