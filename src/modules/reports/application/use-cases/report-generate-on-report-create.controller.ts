import { Inject, Injectable } from '@nestjs/common';
import { GenerateReportUseCase } from 'src/modules/reports/application/use-cases/generate-report.use-case';
import { CreateReportDomainEvent } from 'src/modules/reports/domain/events/create.report.domain.event';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { REPORT_SYMBOLS } from 'src/modules/reports/reports.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { DomainEventClass } from 'src/shared/events/domain/domain.event';
import { EventBusSubscriber } from 'src/shared/events/domain/event.bus.subscriber';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';

@Injectable()
export class ReportGenerateOnReportCreate
  implements EventBusSubscriber<CreateReportDomainEvent>
{
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.GENERATE_REPORT_USE_CASE)
    private readonly generateReportUseCase: GenerateReportUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public subscribedTo(): DomainEventClass[] {
    return [CreateReportDomainEvent];
  }

  public async on(event: CreateReportDomainEvent): Promise<void> {
    this.logger.debug(`Generating report on report create`, { event });
    await this.generateReportUseCase.run(new ReportId(event.instanceId));
  }
}
