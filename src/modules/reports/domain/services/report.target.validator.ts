import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportTarget, ReportTargets } from '../value-objects/report.target';
import { ReportTargetId } from '../value-objects/report.target.id';

export class ReportTargetValidator {
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

  public areValid(target: ReportTarget, targetId: ReportTargetId): boolean {
    this.logger.debug(`Validating if target and target ids are valid`, {
      target,
      targetId,
    });

    switch (target.value()) {
      case ReportTargets.developer:
        return targetId.hasDeveloperId();
      default:
        return false;
    }
  }
}
