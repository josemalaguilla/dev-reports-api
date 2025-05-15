import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { UseCase } from 'src/shared/core/domain/use-cases/base.use-case';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportWithPrimitives } from '../../domain/entities/report';
import { ReportRepository } from '../../domain/ports/report.repository';
import { ReportFinder } from '../../domain/services/report.finder';
import { ReportId } from '../../domain/value-objects/report.id';
import { REPORT_SYMBOLS } from '../../reports.symbols';

export class FindReportByIdUseCase
  implements UseCase<ReportWithPrimitives, [ReportId]>
{
  private readonly logger: Logger;
  private readonly finder: ReportFinder;

  constructor(
    @Inject(REPORT_SYMBOLS.REPORT_REPOSITORY)
    repository: ReportRepository,
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

  public async run(id: ReportId): Promise<ReportWithPrimitives> {
    this.logger.debug('Finding report by id', {
      id,
    });

    const report = await this.finder.findById(id);

    this.logger.debug('Report found', {
      id: report.id,
    });

    return report.toPrimitives();
  }
}
