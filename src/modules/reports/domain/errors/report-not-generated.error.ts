import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { ReportId } from '../value-objects/report.id';

export class ReportNotGeneratedError extends ApplicationError {
  constructor(reportId: ReportId) {
    super();
    this.message = `Report ${reportId.value()} it has not been generated`;
  }
}
