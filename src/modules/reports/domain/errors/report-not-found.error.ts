import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { ReportId } from '../value-objects/report.id';

export class ReportNotFoundError extends ApplicationError {
  constructor(id: ReportId) {
    super();
    this.message = `Report with id ${id.value()} not found`;
  }
}
