import {
  Report,
  ReportWithPrimitives,
} from 'src/modules/reports/domain/entities/report';
import { ReportCreatedAt } from 'src/modules/reports/domain/value-objects/report.created.at';
import { ReportEndDate } from 'src/modules/reports/domain/value-objects/report.end.date';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { ReportStartDate } from 'src/modules/reports/domain/value-objects/report.start.date';
import { ReportStatus } from 'src/modules/reports/domain/value-objects/report.status';
import { ReportTarget } from 'src/modules/reports/domain/value-objects/report.target';
import { ReportTargetId } from 'src/modules/reports/domain/value-objects/report.target.id';
import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { ReportGeneratedFileMother } from '../value-objects/report.generated.file.mother';
import { ReportStatusMother } from '../value-objects/report.status.mother';
import { ReportTargetIdMother } from '../value-objects/report.target.id.mother';
import { ReportTargetMother } from '../value-objects/report.target.mother';

export class ReportMother {
  public static random(params?: Partial<ReportWithPrimitives>): Report {
    const randomizer = RandomizerStore.get();
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - randomizer.integer(1, 30));
    const endDate = new Date(now);

    return new Report(
      params?.id ? new ReportId(params.id) : ReportId.create(),
      params?.target
        ? new ReportTarget(params.target)
        : ReportTargetMother.random(),
      params?.createdAt
        ? new ReportCreatedAt(params.createdAt)
        : ReportCreatedAt.now(),
      params?.status
        ? new ReportStatus(params.status)
        : ReportStatusMother.random(),
      params?.targetId
        ? new ReportTargetId(params.targetId)
        : ReportTargetIdMother.random(),
      params?.startDate
        ? new ReportStartDate(params.startDate)
        : new ReportStartDate(startDate.toISOString()),
      params?.endDate
        ? new ReportEndDate(params.endDate)
        : new ReportEndDate(endDate.toISOString()),
    );
  }

  public static completed(): Report {
    const report = this.random();
    report.markAsGenerated(ReportGeneratedFileMother.random());
    return report;
  }
}
