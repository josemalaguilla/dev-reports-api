import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import {
  ReportTarget,
  ReportTargets,
} from '../../../../../src/modules/reports/domain/value-objects/report.target';

export class ReportTargetMother {
  public static random(): ReportTarget {
    const randomizer = RandomizerStore.get();
    const values = Object.values(ReportTargets);
    const randomIndex = randomizer.integer(0, values.length - 1);
    return new ReportTarget(values[randomIndex]);
  }
}
