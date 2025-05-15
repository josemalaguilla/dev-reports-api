import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { FindReportByIdUseCase } from '../../../../../src/modules/reports/application/use-cases/find-report-by-id.use-case';
import { Report } from '../../../../../src/modules/reports/domain/entities/report';
import { ReportNotFoundError } from '../../../../../src/modules/reports/domain/errors/report-not-found.error';
import { ReportMother } from '../../domain/entities/report.mother';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('FindReportByIdUseCase', () => {
  let useCase: FindReportByIdUseCase;
  let repository: ReportRepository;
  let validReport: Report;
  let validReportId: ReportId;

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    useCase = new FindReportByIdUseCase(repository);
    validReport = ReportMother.random();
    validReportId = validReport.id;
  });

  it('should find a report by id', async () => {
    mockDatasourceToFindReport();

    const result = await useCase.run(validReportId);

    expectToReturnDatasourceReport(result);
    expectToFindByIdOnDatasourceWithCorrectParams();
  });

  it('should throw not found error if report does not exist', async () => {
    mockDatasourceToNotFindAnyReport();

    try {
      await useCase.run(validReportId);
      fail('Expected to throw ReportNotFoundError');
    } catch (error) {
      expectToThrowNotFoundError(error);
    }
  });

  function mockDatasourceToFindReport(): void {
    repository.findOne = jest.fn().mockResolvedValue(validReport);
  }

  function mockDatasourceToNotFindAnyReport(): void {
    repository.findOne = jest.fn().mockResolvedValue(null);
  }

  function expectToReturnDatasourceReport(result: any): void {
    expect(validReport.toPrimitives()).toEqual(result);
  }

  function expectToFindByIdOnDatasourceWithCorrectParams(): void {
    expect(repository.findOne).toHaveBeenCalledWith([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(validReport.id.value()),
      ),
    ]);
  }

  function expectToThrowNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(ReportNotFoundError);
  }
});
