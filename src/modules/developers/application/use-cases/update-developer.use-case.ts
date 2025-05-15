import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Primitives } from 'src/shared/core/domain/value-object/primitive.value.object';
import { ValueObject } from 'src/shared/core/domain/value-object/value.object';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { UseCase } from '../../../../shared/core/domain/use-cases/base.use-case';
import { DEVELOPER_SYMBOLS } from '../../developers.symbols';
import {
  Developer,
  DeveloperWithPrimitives,
} from '../../domain/entities/developer';
import { DeveloperRepository } from '../../domain/ports/developer.repository';
import { DeveloperEmailUniquenessChecker } from '../../domain/services/developer.email.uniqueness.checker';
import { DeveloperFinder } from '../../domain/services/developer.finder';
import { DeveloperId } from '../../domain/value-objects/developer.id';
import { DeveloperUpdateQuery } from '../dtos/developer.update.query';

export class UpdateDeveloperUseCase
  implements
    UseCase<DeveloperWithPrimitives, [DeveloperId, DeveloperUpdateQuery]>
{
  private readonly finder: DeveloperFinder;
  private readonly emailUniqueChecker: DeveloperEmailUniquenessChecker;
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.DEVELOPER_REPOSITORY)
    private readonly repository: DeveloperRepository,
    @Inject(DEVELOPER_SYMBOLS.DEVELOPER_EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.finder = new DeveloperFinder(repository);
    this.emailUniqueChecker = new DeveloperEmailUniquenessChecker(repository);
  }

  public async run(
    id: DeveloperId,
    updateQuery: DeveloperUpdateQuery,
  ): Promise<DeveloperWithPrimitives> {
    this.logger.debug('Updating developer', {
      id: id,
      updateFields: Object.keys(updateQuery),
    });

    if (updateQuery.email) {
      await this.emailUniqueChecker.ensureEmailIsUnique(updateQuery.email, id);
    }

    const developer = await this.finder.findById(id);
    this.updateDeveloper(developer, updateQuery);
    await this.repository.save(developer);
    await this.eventBus.publish(developer.pullDomainEvents());

    this.logger.debug('Developer updated successfully', {
      id,
    });

    return developer.toPrimitives();
  }

  private updateDeveloper(
    developer: Developer,
    update: DeveloperUpdateQuery,
  ): void {
    for (const updateField in update) {
      if (Object.prototype.hasOwnProperty.call(update, updateField)) {
        const newValue = update[updateField];
        this.updateField(developer, updateField, newValue);
      }
    }
  }

  private updateField(
    developer: Developer,
    updateField: string,
    newValue?: ValueObject<Primitives>,
  ): void {
    const updateFunction = this.getUpdateFunction(developer, updateField);
    if (!updateFunction) return;

    if (this.valueIsInUpdateQuery(newValue)) {
      const valueToSet = this.isUnsettingValue(newValue) ? null : newValue;
      this.logger.verbose('Updating field', {
        field: updateField,
        value: valueToSet,
      });
      updateFunction(valueToSet);
    }
  }

  private getUpdateFunction(
    developer: Developer,
    updateField: string,
  ): (newValue: ValueObject<Primitives>) => void {
    const updateFunctions = {
      name: developer.updateName.bind(developer),
      lastName: developer.updateLastName.bind(developer),
      email: developer.updateEmail.bind(developer),
    };
    return updateFunctions[updateField];
  }

  private valueIsInUpdateQuery(newValue?: ValueObject<Primitives>) {
    return newValue !== null && newValue !== undefined;
  }

  private isUnsettingValue(newValue: ValueObject<Primitives>) {
    return newValue.value() === '';
  }
}
