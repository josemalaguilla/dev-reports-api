import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { UseCase } from 'src/shared/core/domain/use-cases/base.use-case';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { DEVELOPER_SYMBOLS } from '../../developers.symbols';
import {
  Developer,
  DeveloperWithPrimitives,
} from '../../domain/entities/developer';
import { DeveloperRepository } from '../../domain/ports/developer.repository';
import { DeveloperEmailUniquenessChecker } from '../../domain/services/developer.email.uniqueness.checker';
import { DeveloperEmail } from '../../domain/value-objects/developer.email';
import { DeveloperId } from '../../domain/value-objects/developer.id';
import { DeveloperLastName } from '../../domain/value-objects/developer.last.name';
import { DeveloperName } from '../../domain/value-objects/developer.name';

export class CreateDeveloperUseCase
  implements
    UseCase<
      DeveloperWithPrimitives,
      [DeveloperName, DeveloperEmail, DeveloperLastName]
    >
{
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
    this.emailUniqueChecker = new DeveloperEmailUniquenessChecker(repository);
  }

  public async run(
    name: DeveloperName,
    email: DeveloperEmail,
    lastName?: DeveloperLastName,
  ): Promise<DeveloperWithPrimitives> {
    this.logger.debug('Creating new developer', {
      name,
      email,
      lastName,
    });

    await this.emailUniqueChecker.ensureEmailIsUnique(email);

    const developer = Developer.create(
      DeveloperId.create(),
      name,
      email,
      lastName,
    );

    await this.repository.save(developer);
    await this.eventBus.publish(developer.pullDomainEvents());

    this.logger.debug('Developer created successfully', {
      id: developer.id,
    });

    return developer.toPrimitives();
  }
}
