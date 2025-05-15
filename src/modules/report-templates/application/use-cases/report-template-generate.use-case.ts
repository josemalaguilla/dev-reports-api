import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { File } from 'src/shared/file/domain/file';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportGenerationParams } from '../../domain/report.generation.params';
import {
  ReportTemplateId,
  ReportTemplateIds,
} from '../../domain/report.template.id';
import { ReportTemplateNotFound } from '../../domain/report.template.not.found';
import { REPORT_TEMPLATE_SYMBOLS } from '../../report-template.symbols';
import { DeveloperReportTemplateGenerateUseCase } from './developer-report-template-generate.use-case';
import { ReportTemplateUseCase } from './report.template.use-case';

export class ReportTemplateGenerateUseCase implements ReportTemplateUseCase {
  private readonly logger: Logger;
  private reportTemplates: Record<ReportTemplateIds, ReportTemplateUseCase>;

  constructor(
    @Inject(REPORT_TEMPLATE_SYMBOLS.DEVELOPER_REPORT_TEMPLATE_GENERATE_USE_CASE)
    developerReportTemplateGenerateUseCase: DeveloperReportTemplateGenerateUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.reportTemplates = {
      [ReportTemplateIds.developer]: developerReportTemplateGenerateUseCase,
    };
  }

  public async run(
    templateId: ReportTemplateId,
    params: ReportGenerationParams,
  ): Promise<File> {
    this.logger.log('Generating report template', {
      templateId: templateId,
      params: params,
    });

    const report = this.reportTemplates[templateId.value()];
    if (!report) {
      throw new ReportTemplateNotFound(templateId);
    }
    return report.run(templateId, params);
  }
}
