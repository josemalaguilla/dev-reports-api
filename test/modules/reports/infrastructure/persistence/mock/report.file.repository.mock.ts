import { ReportFileRepository } from 'src/modules/reports/domain/ports/report.file.repository';

export class ReportFileRepositoryMock implements ReportFileRepository {
  writeFile = jest.fn();
  readFile = jest.fn();
}
