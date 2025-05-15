import { Message } from '@aws-sdk/client-sqs';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  DomainEvent,
  DomainEventWithPrimitives,
} from 'src/shared/events/domain/domain.event';
import { EventBusSubscriber } from 'src/shared/events/domain/event.bus.subscriber';
import { DomainEventJSONDeserializer } from 'src/shared/events/infrastructure/domain.event.json.deserializer';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { EventProcessingError } from '../../domain/event.processing.error';
import { EventProcessingErrors } from '../../domain/event.processing.errors';

export abstract class SQSEventConsumer {
  protected subscribers: EventBusSubscriber<DomainEvent>[] = [];
  protected logger: Logger;
  protected readonly deserializer: DomainEventJSONDeserializer;

  constructor() {
    this.deserializer = new DomainEventJSONDeserializer();
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async processMessage(message: Message): Promise<void> {
    try {
      const eventData = this.getMessageBody(message);
      this.logger.debug('Processing SQS message', {
        messageId: message.MessageId,
        eventName: eventData.eventName,
      });

      const subscribersForEvent = this.getSubscribersForEvent(
        eventData.eventName,
      );
      this.logger.debug('Found subscribers for event', {
        eventName: eventData.eventName,
        subscriberCount: subscribersForEvent.length,
      });
      if (subscribersForEvent.length <= 0) return;

      const domainEvent = this.deserializer.deserialize(
        eventData as DomainEventWithPrimitives,
      );
      await this.triggerSubscribers(subscribersForEvent, domainEvent);
    } catch (error) {
      this.logger.error(`Error processing SQS message`, { error });
      throw error;
    }
  }

  private getMessageBody(message: Message): DomainEventWithPrimitives {
    return JSON.parse(message.Body);
  }

  private getSubscribersForEvent(
    eventName: string,
  ): EventBusSubscriber<DomainEvent>[] {
    return this.subscribers.filter((subscriber) =>
      subscriber
        .subscribedTo()
        .some((eventClass) => eventClass.EVENT_NAME === eventName),
    );
  }

  private async triggerSubscribers(
    subscribersForEvent: EventBusSubscriber<DomainEvent>[],
    domainEvent: DomainEvent,
  ): Promise<void> {
    const errors = [];
    for (const subscriber of subscribersForEvent) {
      try {
        await subscriber.on(domainEvent);
      } catch (error) {
        this.logger.error('Error processing event in subscriber', {
          eventName: domainEvent.eventName,
          subscriberName: subscriber.constructor.name,
          error: error.message,
        });
        errors.push(
          new EventProcessingError(subscriber.constructor.name, error),
        );
      }
    }

    if (errors.length > 0) {
      throw new EventProcessingErrors(errors);
    }
  }
}
