import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { ReportEndDate } from '../value-objects/report.end.date';
import { ReportStartDate } from '../value-objects/report.start.date';

export class ReportDatesInvalidError extends ApplicationError {
  constructor(startDate: ReportStartDate, endDate: ReportEndDate) {
    super();
    this.message = `The given dates are not valid ${startDate.value()} - ${endDate.value()}. End date must be after start date`;
  }
}
