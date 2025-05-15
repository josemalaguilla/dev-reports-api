import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { ReportGeneratedFile } from '../../../../../src/modules/reports/domain/value-objects/report.generated.file';

export class ReportGeneratedFileMother {
  public static random(): ReportGeneratedFile {
    const randomizer = RandomizerStore.get();
    return new ReportGeneratedFile(
      `${randomizer.fileName()}${randomizer.fileExtension()}`,
    );
  }
}
