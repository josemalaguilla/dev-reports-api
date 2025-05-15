import { Inject } from '@nestjs/common';
import { ReportFileRepository } from 'src/modules/reports/domain/ports/report.file.repository';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { File } from 'src/shared/file/domain/file';
import { FilePath } from 'src/shared/file/domain/file.path';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportNotGeneratedError } from '../../domain/errors/report-not-generated.error';
import { ReportFinder } from '../../domain/services/report.finder';
import { REPORT_SYMBOLS } from '../../reports.symbols';

export class DownloadReportUseCase {
  private readonly logger: Logger;
  private readonly reportFinder: ReportFinder;

  constructor(
    @Inject(REPORT_SYMBOLS.REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepository,
    @Inject(REPORT_SYMBOLS.REPORT_FILE_REPOSITORY)
    private readonly reportFileRepository: ReportFileRepository,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.reportFinder = new ReportFinder(this.reportRepository);
  }

  async run(reportId: ReportId): Promise<File> {
    this.logger.debug('Downloading report file', {
      reportId,
    });

    const report = await this.reportFinder.findById(reportId);
    if (!report.generatedFile?.value()) {
      throw new ReportNotGeneratedError(reportId);
    }
    const filePath = new FilePath(report.generatedFile.value());
    const file = await this.reportFileRepository.readFile(filePath);

    this.logger.debug('Report file downloaded successfully', {
      reportId,
    });

    return file;
  }
}
