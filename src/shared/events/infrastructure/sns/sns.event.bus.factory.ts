import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { SNSEventBus } from './sns.event.bus';
import { SNSEventPublisher } from './sns.event.publisher';
import { SNSTopic } from './value-objects/sns.topic';

export class SNSEventBusFactory {
  private readonly logger: Logger;

  constructor(
    @Inject(SNSEventPublisher)
    private readonly snsEventPublisher: SNSEventPublisher,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public create(topic: SNSTopic): SNSEventBus {
    this.logger.debug('Creating SNSEventBus', {
      topicArn: topic,
    });

    return new SNSEventBus(this.snsEventPublisher, topic);
  }
}
