import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { Report } from '../entities/report';
import { ReportNotFoundError } from '../errors/report-not-found.error';
import { ReportRepository } from '../ports/report.repository';
import { ReportId } from '../value-objects/report.id';

export class ReportFinder {
  private readonly logger: Logger;

  constructor(private readonly repository: ReportRepository) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.services)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async findById(id: ReportId): Promise<Report> {
    this.logger.debug('Finding report by id', { id });

    const instance = await this.repository.findOne([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(id.value()),
      ),
    ]);

    if (!instance) {
      this.logger.error('Report not found', { id });
      throw new ReportNotFoundError(id);
    }
    return instance;
  }
}
