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
import { NotEqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/not.equal.filter';
import { Filters } from 'src/shared/persistence/domain/criteria/criteria';
import { DuplicateEmailError } from '../errors/duplicate.email.error';
import { DeveloperRepository } from '../ports/developer.repository';
import { DeveloperEmail } from '../value-objects/developer.email';
import { DeveloperId } from '../value-objects/developer.id';

export class DeveloperEmailUniquenessChecker {
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

  public async ensureEmailIsUnique(
    email: DeveloperEmail,
    excludedId?: DeveloperId,
  ): Promise<void> {
    this.logger.debug('Checking email uniqueness', {
      email,
      excludedId,
    });

    const filter = this.buildFilter(email, excludedId);
    const itemsWithThisEmail = await this.repository.count(filter);

    if (itemsWithThisEmail.value() > 0) {
      this.logger.error('Duplicate email found', { email });
      throw new DuplicateEmailError(email);
    }
  }

  private buildFilter(
    email: DeveloperEmail,
    excludedId?: DeveloperId,
  ): Filters {
    const conditions: Filters = [
      new EqualCondition(
        new ConditionField('email'),
        new ConditionValue(email.value()),
      ),
    ];

    if (excludedId) {
      conditions.push(
        new NotEqualCondition(
          new ConditionField('id'),
          new ConditionValue(excludedId.value()),
        ),
      );
    }
    return conditions;
  }
}
