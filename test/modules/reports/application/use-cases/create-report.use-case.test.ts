import { ReportDatesInvalidError } from 'src/modules/reports/domain/errors/report-dates-invalid.error';
import { ReportTargetInvalidError } from 'src/modules/reports/domain/errors/report-target-invalid.error';
import { CreateReportDomainEvent } from 'src/modules/reports/domain/events/create.report.domain.event';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportEndDate } from 'src/modules/reports/domain/value-objects/report.end.date';
import { ReportStartDate } from 'src/modules/reports/domain/value-objects/report.start.date';
import { ReportStatuses } from 'src/modules/reports/domain/value-objects/report.status';
import { ReportTarget } from 'src/modules/reports/domain/value-objects/report.target';
import { ReportTargetId } from 'src/modules/reports/domain/value-objects/report.target.id';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { CreateReportUseCase } from '../../../../../src/modules/reports/application/use-cases/create-report.use-case';
import {
  Report,
  ReportWithPrimitives,
} from '../../../../../src/modules/reports/domain/entities/report';
import { ReportTargetIdMother } from '../../domain/value-objects/report.target.id.mother';
import { ReportTargetMother } from '../../domain/value-objects/report.target.mother';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('CreateReportUseCase', () => {
  let useCase: CreateReportUseCase;
  let repository: ReportRepository;
  let eventBus: EventBus;
  let target: ReportTarget;
  let targetId: ReportTargetId;
  let startDate: ReportStartDate;
  let endDate: ReportEndDate;

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    eventBus = new EventBusMock();
    useCase = new CreateReportUseCase(repository, eventBus);
    target = ReportTargetMother.random();
    targetId = ReportTargetIdMother.random();

    const start = new Date();
    start.setDate(start.getDate() - 1);
    startDate = new ReportStartDate(start.toISOString());
    endDate = ReportEndDate.now();
  });

  it('should create a report', async () => {
    const createdReport = await useCase.run(
      target,
      targetId,
      startDate,
      endDate,
    );

    expectResultToMatchTheCommandFields(createdReport);
    expectToHaveSaved();
  });

  it('should emit a created report event', async () => {
    await useCase.run(target, targetId, startDate, endDate);

    expectToHaveEmittedCreateReportEvent();
  });

  it('should throw invalid target error when developerId is not given in developer report', async () => {
    try {
      await useCase.run(
        target,
        {
          value: () => {
            return { teamId: '123e4567-e89b-12d3-a456-427814174023' };
          },
          hasDeveloperId: () => false,
        } as unknown as ReportTargetId,
        startDate,
        endDate,
      );
    } catch (error) {
      expectToThrowInvalidTargetError(error);
    }
  });

  it('should throw invalid dates error when endDate is not after startDate', async () => {
    try {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const invalidStartDate = new ReportStartDate(start.toISOString());
      const invalidEndDate = ReportEndDate.now();
      await useCase.run(target, targetId, invalidStartDate, invalidEndDate);
    } catch (error) {
      expectToThrowInvalidDateError(error);
    }
  });

  function expectResultToMatchTheCommandFields(
    result: ReportWithPrimitives,
  ): void {
    expect(result).toBeDefined();
    expect(result.target).toBe(target.value());
    expect(result.targetId).toEqual(targetId.value());
    expect(result.status).toBe(ReportStatuses.PENDING);
    expect(result.startDate).toBe(startDate.value());
    expect(result.endDate).toBe(endDate.value());
    expect(result.createdAt).toBeDefined();
    expect(result.generatedAt).toBeUndefined();
    expect(result.deletedAt).toBeUndefined();
    expect(result.generatedFile).toBeUndefined();
  }

  function expectToHaveSaved(): void {
    expect(repository.save).toHaveBeenCalledWith(expect.any(Report));
  }

  function expectToHaveEmittedCreateReportEvent(): void {
    expect(eventBus.publish).toHaveBeenCalledWith([
      expect.any(CreateReportDomainEvent),
    ]);
  }

  function expectToThrowInvalidTargetError(error: Error): void {
    expect(error).toBeInstanceOf(ReportTargetInvalidError);
  }

  function expectToThrowInvalidDateError(error: Error): void {
    expect(error).toBeInstanceOf(ReportDatesInvalidError);
  }
});
