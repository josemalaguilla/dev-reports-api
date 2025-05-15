import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { UseCase } from 'src/shared/core/domain/use-cases/base.use-case';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { Report, ReportWithPrimitives } from '../../domain/entities/report';
import { ReportDatesInvalidError } from '../../domain/errors/report-dates-invalid.error';
import { ReportTargetInvalidError } from '../../domain/errors/report-target-invalid.error';
import { ReportRepository } from '../../domain/ports/report.repository';
import { ReportDatesValidator } from '../../domain/services/report.dates.validator';
import { ReportTargetValidator } from '../../domain/services/report.target.validator';
import { ReportEndDate } from '../../domain/value-objects/report.end.date';
import { ReportId } from '../../domain/value-objects/report.id';
import { ReportStartDate } from '../../domain/value-objects/report.start.date';
import { ReportTarget } from '../../domain/value-objects/report.target';
import { ReportTargetId } from '../../domain/value-objects/report.target.id';
import { REPORT_SYMBOLS } from '../../reports.symbols';

export class CreateReportUseCase
  implements
    UseCase<
      ReportWithPrimitives,
      [ReportTarget, ReportTargetId, ReportStartDate, ReportEndDate]
    >
{
  private readonly logger: Logger;
  private readonly targetValidator: ReportTargetValidator;
  private readonly datesValidator: ReportDatesValidator;

  constructor(
    @Inject(REPORT_SYMBOLS.REPORT_REPOSITORY)
    private readonly repository: ReportRepository,
    @Inject(REPORT_SYMBOLS.REPORT_EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.targetValidator = new ReportTargetValidator();
    this.datesValidator = new ReportDatesValidator();
  }

  public async run(
    target: ReportTarget,
    targetId: ReportTargetId,
    startDate: ReportStartDate,
    endDate: ReportEndDate,
  ): Promise<ReportWithPrimitives> {
    if (!this.targetValidator.areValid(target, targetId)) {
      throw new ReportTargetInvalidError(target, targetId);
    }

    if (!this.datesValidator.areValid(startDate, endDate)) {
      throw new ReportDatesInvalidError(startDate, endDate);
    }
    this.logger.debug('Creating new report', {
      target,
      targetId,
      startDate,
      endDate,
    });

    const report = Report.create(
      ReportId.create(),
      target,
      targetId,
      startDate,
      endDate,
    );

    await this.repository.save(report);
    await this.eventBus.publish(report.pullDomainEvents());

    this.logger.debug('Report created successfully', {
      id: report.id,
    });

    return report.toPrimitives();
  }
}
