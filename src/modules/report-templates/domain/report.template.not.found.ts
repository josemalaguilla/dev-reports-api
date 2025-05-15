import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { ReportTemplateId } from './report.template.id';

export class ReportTemplateNotFound extends ApplicationError {
  constructor(templateId: ReportTemplateId) {
    super();
    this.message = `Report template with id ${templateId.value()} not found`;
  }
}
