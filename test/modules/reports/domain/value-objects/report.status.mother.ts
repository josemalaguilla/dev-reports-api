import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import {
  ReportStatus,
  ReportStatuses,
} from '../../../../../src/modules/reports/domain/value-objects/report.status';

export class ReportStatusMother {
  public static random(): ReportStatus {
    const randomizer = RandomizerStore.get();
    const statusValues = Object.values(ReportStatuses);
    const randomIndex = randomizer.integer(0, statusValues.length - 1);
    return new ReportStatus(statusValues[randomIndex]);
  }
}
