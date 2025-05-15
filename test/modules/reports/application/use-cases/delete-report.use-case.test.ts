import { Report } from 'src/modules/reports/domain/entities/report';
import { DeleteReportDomainEvent } from 'src/modules/reports/domain/events/delete.report.domain.event';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { DeleteReportUseCase } from '../../../../../src/modules/reports/application/use-cases/delete-report.use-case';
import { ReportNotFoundError } from '../../../../../src/modules/reports/domain/errors/report-not-found.error';
import { ReportMother } from '../../domain/entities/report.mother';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('DeleteReportUseCase', () => {
  let useCase: DeleteReportUseCase;
  let repository: ReportRepository;
  let eventBus: EventBus;
  let validReport: Report;

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    eventBus = new EventBusMock();
    useCase = new DeleteReportUseCase(repository, eventBus);
    validReport = ReportMother.random();
  });

  it('should delete a report', async () => {
    mockDatasourceToFindReport();

    await useCase.run(validReport.id);

    expectToSaveOnDatasourceWithCorrectParams();
  });

  it('should publish an event when a report is deleted', async () => {
    mockDatasourceToFindReport();

    await useCase.run(validReport.id);

    expectToHaveEmittedDeletedReportEvent();
  });

  it('should throw not found error if report does not exist', async () => {
    mockDatasourceToNotFindAnyReport();

    try {
      await useCase.run(validReport.id);
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

  function expectToSaveOnDatasourceWithCorrectParams(): void {
    expect(repository.save).toHaveBeenCalledWith(validReport);
  }

  function expectToThrowNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(ReportNotFoundError);
  }

  function expectToHaveEmittedDeletedReportEvent(): void {
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(DeleteReportDomainEvent)]),
    );
  }
});
