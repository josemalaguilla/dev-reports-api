import { File } from 'src/shared/file/domain/file';
import { FilePath } from 'src/shared/file/domain/file.path';
import { Report } from '../entities/report';

export class ReportFilePathBuilder {
  public build(report: Report, file: File): FilePath {
    return new FilePath(
      `/reports/${report.id.value()}/${Date.now()}/${file.fileName}`,
    );
  }
}
