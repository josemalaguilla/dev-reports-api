import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';

export class ReportComparator {
  areEquals(
    reportA: ReportWithPrimitives,
    reportB: ReportWithPrimitives,
  ): boolean {
    if (!reportA || !reportB) {
      return false;
    }

    return (
      reportA.id === reportB.id &&
      reportA.target === reportB.target &&
      reportA.targetId?.developerId === reportB.targetId?.developerId &&
      reportA.status === reportB.status &&
      reportA.createdAt === reportB.createdAt &&
      reportA.startDate === reportB.startDate &&
      reportA.endDate === reportB.endDate
    );
  }
}
