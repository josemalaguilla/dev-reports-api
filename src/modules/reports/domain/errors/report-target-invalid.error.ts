import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { ReportTarget } from '../value-objects/report.target';
import { ReportTargetId } from '../value-objects/report.target.id';

export class ReportTargetInvalidError extends ApplicationError {
  constructor(target: ReportTarget, targetId: ReportTargetId) {
    super();
    this.message = `The given target ${target.value()} is not valid with the given target id ${targetId.toString()}`;
  }
}
