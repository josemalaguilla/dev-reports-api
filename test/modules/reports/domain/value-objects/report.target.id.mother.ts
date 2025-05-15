import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportTargetId } from '../../../../../src/modules/reports/domain/value-objects/report.target.id';

export class ReportTargetIdMother {
  public static random(): ReportTargetId {
    return new ReportTargetId({
      developerId: DeveloperId.create().value(),
    });
  }
}
