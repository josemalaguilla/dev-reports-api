import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { DomainEvent } from '../../domain/domain.event';
import { EventBus } from '../../domain/event.bus';
import { SNSEventPublisher } from './sns.event.publisher';
import { SNSTopic } from './value-objects/sns.topic';

export class SNSEventBus implements EventBus {
  private readonly logger: Logger;

  constructor(
    private readonly snsEventPublisher: SNSEventPublisher,
    private readonly topic: SNSTopic,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async publish(events: DomainEvent[]): Promise<void> {
    this.logger.debug('Publishing domain events', {
      eventCount: events.length,
      topicArn: this.topic,
    });

    for (const event of events) {
      await this.snsEventPublisher.publish(
        this.topic,
        event.toPrimitives(),
        event.eventName,
      );
    }
  }
}
