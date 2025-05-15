import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import {
  DomainEvent,
  DomainEventClass,
  DomainEventWithPrimitives,
} from '../domain/domain.event';
import { EventBusSubscriber } from '../domain/event.bus.subscriber';
import { UnknownEventError } from '../domain/unknown.event.error';

export class DomainEventJSONDeserializer {
  private readonly eventClasses: { [eventName: string]: DomainEventClass } = {};
  private readonly logger: Logger;

  constructor() {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.services)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  /**
   * Initializes the dictionary of events with the subscribed consumers
   * @param subscribers Subscribers in the application whose will use the deserializer to transform the event from
   * json into domain event class
   */
  public configure(subscribers: EventBusSubscriber<DomainEvent>[]): void {
    for (const subscriber of subscribers) {
      const events = subscriber.subscribedTo();
      // For each event of all the subscribers we build a dictionary with eventName - eventClass
      for (const eventClass of events) {
        this.eventClasses[eventClass.EVENT_NAME] = eventClass;
      }
    }

    this.logger.debug('Domain event deserializer configured', {
      registeredEvents: Object.keys(this.eventClasses),
    });
  }

  public deserialize(event: DomainEventWithPrimitives): DomainEvent {
    const eventName = event.eventName;
    const eventClass = this.eventClasses[eventName];

    if (!eventClass) {
      this.logger.error('Event class not found for event name', {
        eventName,
        availableEvents: Object.keys(this.eventClasses),
      });
      throw new UnknownEventError(eventName);
    }

    this.logger.debug('Deserializing domain event', {
      eventName,
      eventId: event.eventId,
    });

    return eventClass.fromPrimitives(event);
  }
}
