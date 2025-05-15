import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportEndDate } from '../value-objects/report.end.date';
import { ReportStartDate } from '../value-objects/report.start.date';

export class ReportDatesValidator {
  private readonly logger: Logger;
  constructor() {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.services)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public areValid(startDate: ReportStartDate, endDate: ReportEndDate): boolean {
    this.logger.debug(`Validating if target and target ids are valid`, {
      startDate,
      endDate,
    });
    return startDate.isBefore(endDate);
  }
}
