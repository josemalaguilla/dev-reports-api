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
import { Developer } from '../entities/developer';
import { DeveloperNotFoundError } from '../errors/developer.not-found.error';
import { DeveloperRepository } from '../ports/developer.repository';
import { DeveloperId } from '../value-objects/developer.id';

export class DeveloperFinder {
  private readonly logger: Logger;

  constructor(private readonly repository: DeveloperRepository) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.services)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async findById(id: DeveloperId): Promise<Developer> {
    this.logger.debug('Finding developer by id', { id });

    const instance = await this.repository.findOne([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(id.value()),
      ),
    ]);

    if (!instance) {
      this.logger.error('Developer not found', { id });
      throw new DeveloperNotFoundError(id);
    }
    return instance;
  }
}
