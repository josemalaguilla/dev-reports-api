import { EnumValueObject } from 'src/shared/core/domain/value-object/enum.value.object';
import { Report } from '../../reports/domain/entities/report';

export enum ReportTemplateIds {
  developer = 'developer',
}

export class ReportTemplateId extends EnumValueObject<string> {
  constructor(templateId: ReportTemplateIds) {
    super(templateId, Object.values(ReportTemplateIds));
  }

  public static fromReport(report: Report): ReportTemplateId {
    return new ReportTemplateId(report.target.value() as ReportTemplateIds);
  }

  public static developer() {
    return new ReportTemplateId(ReportTemplateIds.developer);
  }
}
