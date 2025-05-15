import { Report } from 'src/modules/reports/domain/entities/report';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { BasicRepositoryMock } from 'test/shared/persistence/infrastructure/mock/basic.repository.mock';

export class ReportRepositoryMock
  extends BasicRepositoryMock<Report>
  implements ReportRepository {}
