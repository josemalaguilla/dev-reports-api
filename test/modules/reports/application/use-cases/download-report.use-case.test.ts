import { ReportNotFoundError } from 'src/modules/reports/domain/errors/report-not-found.error';
import { ReportNotGeneratedError } from 'src/modules/reports/domain/errors/report-not-generated.error';
import { ReportFileRepository } from 'src/modules/reports/domain/ports/report.file.repository';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { File } from 'src/shared/file/domain/file';
import { FilePath } from 'src/shared/file/domain/file.path';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { FileMother } from 'test/shared/file/domain/file.mother';
import { DownloadReportUseCase } from '../../../../../src/modules/reports/application/use-cases/download-report.use-case';
import { Report } from '../../../../../src/modules/reports/domain/entities/report';
import { ReportMother } from '../../domain/entities/report.mother';
import { ReportFileRepositoryMock } from '../../infrastructure/persistence/mock/report.file.repository.mock';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('DownloadReportUseCase', () => {
  let useCase: DownloadReportUseCase;
  let repository: ReportRepository;
  let reportFileRepository: ReportFileRepository;
  let validReport: Report;
  let validReportId: ReportId;
  let validFile: File;

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    reportFileRepository = new ReportFileRepositoryMock();
    useCase = new DownloadReportUseCase(repository, reportFileRepository);
    validReport = ReportMother.completed();
    validReportId = validReport.id;
    validFile = FileMother.random();
  });

  it('should download a report file', async () => {
    givenReportExists();
    givenFileHasBeenGenerated();

    const result = await useCase.run(validReportId);

    expectToReturnFile(result);
    expectToFindByIdOnDatasourceWithCorrectParams();
    expectToReadFileWithCorrectParams();
  });

  it('should throw not found error if report does not exist', async () => {
    givenReportNotExists();

    try {
      await useCase.run(validReportId);
    } catch (error) {
      expectToThrowNotFoundError(error);
    }
  });

  it('should throw not found error if report has no generated file', async () => {
    givenReportExistsButFileNotHasBeenGenerated();

    try {
      await useCase.run(validReportId);
    } catch (error) {
      expectToThrowReportNotGeneratedError(error);
    }
  });

  function givenReportExists(): void {
    repository.findOne = jest.fn().mockResolvedValue(validReport);
  }

  function givenReportNotExists(): void {
    repository.findOne = jest.fn().mockResolvedValue(null);
  }

  function givenReportExistsButFileNotHasBeenGenerated(): void {
    const reportWithoutFile = ReportMother.random({
      generatedFile: undefined,
    });
    repository.findOne = jest.fn().mockResolvedValue(reportWithoutFile);
  }

  function givenFileHasBeenGenerated(): void {
    reportFileRepository.readFile = jest.fn().mockResolvedValue(validFile);
  }

  function expectToReturnFile(result: File): void {
    expect(validFile.equals(result)).toBeTruthy();
  }

  function expectToFindByIdOnDatasourceWithCorrectParams(): void {
    expect(repository.findOne).toHaveBeenCalledWith([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(validReport.id.value()),
      ),
    ]);
  }

  function expectToReadFileWithCorrectParams(): void {
    expect(reportFileRepository.readFile).toHaveBeenCalledWith(
      new FilePath(validReport.generatedFile.value()),
    );
  }

  function expectToThrowNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(ReportNotFoundError);
  }

  function expectToThrowReportNotGeneratedError(error: Error): void {
    expect(error).toBeInstanceOf(ReportNotGeneratedError);
  }
});
