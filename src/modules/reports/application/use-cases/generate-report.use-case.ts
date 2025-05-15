import { Inject } from '@nestjs/common';
import { ReportTemplateGenerateUseCase } from 'src/modules/report-templates/application/use-cases/report-template-generate.use-case';
import { REPORT_TEMPLATE_SYMBOLS } from 'src/modules/report-templates/report-template.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { UseCase } from 'src/shared/core/domain/use-cases/base.use-case';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportFileRepository } from '../../domain/ports/report.file.repository';
import { ReportRepository } from '../../domain/ports/report.repository';
import { ReportFinder } from '../../domain/services/report.finder';
import { ReportGenerator } from '../../domain/services/report.generator';
import { ReportErrorMessages } from '../../domain/value-objects/report.error.messages';
import { ReportId } from '../../domain/value-objects/report.id';
import { REPORT_SYMBOLS } from '../../reports.symbols';

export class GenerateReportUseCase implements UseCase<void, [ReportId]> {
  private readonly logger: Logger;
  private readonly reportFinder: ReportFinder;
  private readonly reportGenerator: ReportGenerator;

  constructor(
    @Inject(REPORT_SYMBOLS.REPORT_REPOSITORY)
    private readonly repository: ReportRepository,
    @Inject(REPORT_SYMBOLS.REPORT_FILE_REPOSITORY)
    reportFileRepository: ReportFileRepository,
    @Inject(REPORT_TEMPLATE_SYMBOLS.REPORT_TEMPLATE_GENERATE_USE_CASE)
    reportTemplateGenerateUseCase: ReportTemplateGenerateUseCase,
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
    this.reportFinder = new ReportFinder(repository);
    this.reportGenerator = new ReportGenerator(
      reportFileRepository,
      reportTemplateGenerateUseCase,
    );
  }

  public async run(reportId: ReportId): Promise<void> {
    const report = await this.reportFinder.findById(reportId);

    if (report.isCompleted() || report.isProcessing()) {
      this.logger.warn(
        'Report is already completed or processing, skipping generation',
        {
          reportId: reportId,
          status: report.status,
        },
      );
      return;
    }

    report.markAsProcessing();
    await this.repository.save(report);
    await this.eventBus.publish(report.pullDomainEvents());

    try {
      const generatedFile = await this.reportGenerator.generate(report);
      report.markAsGenerated(generatedFile);
    } catch (error) {
      const errorMessages = new ReportErrorMessages([error.message]);
      report.markAsFailed(errorMessages);
      this.logger.error('Failed to generate report', {
        reportId,
        error: error.message,
      });
    } finally {
      await this.repository.save(report);
      await this.eventBus.publish(report.pullDomainEvents());
    }
  }
}
