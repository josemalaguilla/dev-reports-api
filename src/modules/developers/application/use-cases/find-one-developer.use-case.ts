import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
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
import { DeveloperFinder } from '../../domain/services/developer.finder';
import { DeveloperFields } from '../../domain/value-objects/developer.fields';
import { DeveloperId } from '../../domain/value-objects/developer.id';

export declare type ProjectedDeveloper = Partial<DeveloperWithPrimitives>;

export class FindOneDeveloperUseCase
  implements UseCase<ProjectedDeveloper, [DeveloperId, DeveloperFields]>
{
  private readonly finder: DeveloperFinder;
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.DEVELOPER_REPOSITORY)
    repository: DeveloperRepository,
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

  public async run(
    id: DeveloperId,
    fields?: DeveloperFields,
  ): Promise<ProjectedDeveloper> {
    this.logger.debug('Finding developer', {
      id,
      fields,
    });

    const instance = await this.finder.findById(id);

    let cleanedInstance: ProjectedDeveloper = instance.toPrimitives();
    if (fields) {
      cleanedInstance = this.removeUnnededFields(instance, fields);
    }

    this.logger.debug('Developer found', {
      id,
      fields: Object.keys(cleanedInstance),
    });

    return cleanedInstance;
  }

  private removeUnnededFields(
    developer: Developer,
    fields: DeveloperFields,
  ): ProjectedDeveloper {
    const developerWithPrimitives = developer.toPrimitives();
    const cleanedInstance = {};
    for (const field of fields.value()) {
      cleanedInstance[field] = developerWithPrimitives[field];
    }
    return cleanedInstance;
  }
}
