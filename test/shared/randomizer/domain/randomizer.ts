import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../../src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../../src/shared/logger/infrastructure/logger.factory';
import { RandomizerSeed } from './randomizer.seed';

export abstract class Randomizer {
  protected readonly logger: Logger;

  constructor(private readonly seed: RandomizerSeed) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.randomizer)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.logger.debug(`Initializing randomizer`, { seed });
  }

  abstract integer(min?: number, max?: number): number;
  abstract date(): Date;
  abstract email(): string;
  abstract alphaString(): string;
  abstract firstName(): string;
  abstract lastName(): string;
  abstract fileName(): string;
  abstract fileExtension(): string;
}
