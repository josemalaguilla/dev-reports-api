import { ReportTemplateGenerateUseCase } from 'src/modules/report-templates/application/use-cases/report-template-generate.use-case';
import { ReportNotFoundError } from 'src/modules/reports/domain/errors/report-not-found.error';
import { FailedReportDomainEvent } from 'src/modules/reports/domain/events/failed.report.domain.event';
import { GenerateReportDomainEvent } from 'src/modules/reports/domain/events/generate.report.domain.event';
import { UpdateReportStatusDomainEvent } from 'src/modules/reports/domain/events/update.report.status.domain.event';
import { ReportFileRepository } from 'src/modules/reports/domain/ports/report.file.repository';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportStatuses } from 'src/modules/reports/domain/value-objects/report.status';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { File } from 'src/shared/file/domain/file';
import { FilePath } from 'src/shared/file/domain/file.path';
import { ReportFileRepositoryMock } from 'test/modules/reports/infrastructure/persistence/mock/report.file.repository.mock';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { FileMother } from 'test/shared/file/domain/file.mother';
import { GenerateReportUseCase } from '../../../../../src/modules/reports/application/use-cases/generate-report.use-case';
import { Report } from '../../../../../src/modules/reports/domain/entities/report';
import { ReportMother } from '../../domain/entities/report.mother';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('GenerateReportUseCase', () => {
  let useCase: GenerateReportUseCase;
  let repository: ReportRepository;
  let reportTemplateGenerateUseCase: ReportTemplateGenerateUseCase;
  let reportFileRepository: ReportFileRepository;
  let eventBus: EventBus;
  let report: Report;
  let generatedFile: File;

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    eventBus = new EventBusMock();
    reportFileRepository = new ReportFileRepositoryMock();
    reportTemplateGenerateUseCase = {
      run: jest.fn(),
    } as unknown as ReportTemplateGenerateUseCase;
    useCase = new GenerateReportUseCase(
      repository,
      reportFileRepository,
      reportTemplateGenerateUseCase,
      eventBus,
    );
    report = ReportMother.random();
    generatedFile = FileMother.random();
  });

  it('should skip generation if report is already completed', async () => {
    givenTheReportIs(ReportStatuses.COMPLETED);

    await useCase.run(report.id);

    expectNotToHaveSaved();
    expectNotToHaveEmittedEvents();
  });

  it('should skip generation if report is already processing', async () => {
    givenTheReportIs(ReportStatuses.PROCESSING);

    await useCase.run(report.id);

    expectNotToHaveSaved();
    expectNotToHaveEmittedEvents();
  });

  it('should mark report as processing and then as generated when successful', async () => {
    givenTheReportIs(ReportStatuses.PENDING);
    givenReportGenerationSucceeds();

    await useCase.run(report.id);

    expectToHaveSavedFile();
    expectToHaveSaved(2);
    expectToHaveEmittedGenerationEvents();
  });

  it('should mark report as failed when generation fails', async () => {
    givenTheReportIs(ReportStatuses.PENDING);
    givenReportGenerationFails();

    await useCase.run(report.id);

    expectToHaveSaved(2);
    expectToHaveEmittedFailedEvents();
  });

  it('should throw error if report does not exists', async () => {
    givenReportNotExists();

    try {
      await useCase.run(report.id);
    } catch (error) {
      expect(error).toBeInstanceOf(ReportNotFoundError);
      expectNotToHaveSaved();
      expectNotToHaveEmittedEvents();
    }
  });

  function givenTheReportIs(reportStatus: ReportStatuses) {
    report = ReportMother.random({ status: reportStatus });
    repository.findOne = jest.fn().mockResolvedValue(report);
  }

  function givenReportNotExists() {
    repository.findOne = jest.fn().mockResolvedValue(null);
  }

  function givenReportGenerationFails() {
    reportTemplateGenerateUseCase.run = jest
      .fn()
      .mockRejectedValue(new Error('Internal error'));
  }

  function givenReportGenerationSucceeds() {
    reportTemplateGenerateUseCase.run = jest
      .fn()
      .mockResolvedValue(generatedFile);
  }

  function expectToHaveSavedFile(): void {
    const execution = (reportFileRepository.writeFile as jest.Mock).mock
      .calls?.[0];
    const file = execution?.[0] as File;
    const filePath = execution?.[1] as FilePath;
    expect(generatedFile.equals(file)).toBeTruthy();
    expect(filePath).toBeInstanceOf(FilePath);
  }

  function expectToHaveSaved(times = 1): void {
    expect(repository.save).toHaveBeenCalledTimes(times);
  }

  function expectNotToHaveSaved(): void {
    expect(repository.save).not.toHaveBeenCalled();
  }

  function expectToHaveEmittedGenerationEvents(): void {
    expect(eventBus.publish).toHaveBeenCalled();
    const firstEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[0]?.[0]?.[0] as UpdateReportStatusDomainEvent;
    const secondEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[1]?.[0]?.[0] as GenerateReportDomainEvent;
    const thirdEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[1]?.[0]?.[1] as UpdateReportStatusDomainEvent;
    expect(firstEvent).toBeInstanceOf(UpdateReportStatusDomainEvent);
    expect(firstEvent.status).toBe(ReportStatuses.PROCESSING);
    expect(secondEvent).toBeInstanceOf(GenerateReportDomainEvent);
    expect(thirdEvent).toBeInstanceOf(UpdateReportStatusDomainEvent);
    expect(thirdEvent.status).toBe(ReportStatuses.COMPLETED);
  }

  function expectToHaveEmittedFailedEvents(): void {
    expect(eventBus.publish).toHaveBeenCalled();
    const firstEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[0]?.[0]?.[0] as UpdateReportStatusDomainEvent;
    const secondEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[1]?.[0]?.[0] as FailedReportDomainEvent;
    const thirdEvent = (eventBus.publish as jest.Mock).mock
      .calls?.[1]?.[0]?.[1] as UpdateReportStatusDomainEvent;
    expect(firstEvent).toBeInstanceOf(UpdateReportStatusDomainEvent);
    expect(firstEvent.status).toBe(ReportStatuses.PROCESSING);
    expect(secondEvent).toBeInstanceOf(FailedReportDomainEvent);
    expect(thirdEvent).toBeInstanceOf(UpdateReportStatusDomainEvent);
    expect(thirdEvent.status).toBe(ReportStatuses.FAILED);
  }

  function expectNotToHaveEmittedEvents(): void {
    expect(eventBus.publish).not.toHaveBeenCalled();
  }
});
