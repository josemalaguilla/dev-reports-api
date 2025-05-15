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
import { ReportRepository } from '../../domain/ports/report.repository';
import { ReportFinder } from '../../domain/services/report.finder';
import { ReportId } from '../../domain/value-objects/report.id';
import { REPORT_SYMBOLS } from '../../reports.symbols';

export class DeleteReportUseCase implements UseCase<void, [ReportId]> {
  private readonly logger: Logger;
  private readonly finder: ReportFinder;

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
    this.finder = new ReportFinder(repository);
  }

  public async run(id: ReportId): Promise<void> {
    this.logger.debug('Deleting report', {
      id,
    });

    const report = await this.finder.findById(id);
    report.delete();

    await this.repository.save(report);
    await this.eventBus.publish(report.pullDomainEvents());

    this.logger.debug('Report deleted successfully', {
      id: report.id,
    });
  }
}
