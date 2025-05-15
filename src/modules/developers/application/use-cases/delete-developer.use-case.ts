import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { UseCase } from '../../../../shared/core/domain/use-cases/base.use-case';
import { DEVELOPER_SYMBOLS } from '../../developers.symbols';
import { DeveloperRepository } from '../../domain/ports/developer.repository';
import { DeveloperFinder } from '../../domain/services/developer.finder';
import { DeveloperId } from '../../domain/value-objects/developer.id';

export class DeleteDeveloperUseCase implements UseCase<void, [DeveloperId]> {
  private readonly finder: DeveloperFinder;
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
  }

  public async run(id: DeveloperId): Promise<void> {
    this.logger.debug('Deleting developer', { id });

    const developer = await this.finder.findById(id);
    developer.delete();
    await this.repository.delete(developer);
    await this.eventBus.publish(developer.pullDomainEvents());

    this.logger.debug('Developer deleted successfully', { id });
  }
}
