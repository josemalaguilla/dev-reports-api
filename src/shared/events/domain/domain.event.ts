import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  DateString,
  DateValueObject,
} from 'src/shared/core/domain/value-object/date.value.object';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { Uuid } from 'src/shared/core/domain/value-object/uuid';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';

export interface DomainEventWithPrimitives {
  instanceId: string;
  eventId: string;
  occurredOn: DateString;
  eventName: string;
  eventData: EventDataWithPrimitives;
}

export type EventDataWithPrimitives = any;

export type DomainEventClass = {
  EVENT_NAME: string;
  fromPrimitives(event: DomainEventWithPrimitives): DomainEvent;
};

export abstract class DomainEvent implements Printable {
  static EVENT_NAME: string;
  readonly instanceId: string;
  readonly eventId: string;
  readonly occurredOn: DateString;
  readonly eventName: string;
  protected readonly logger: Logger;
  static fromPrimitives: (event: DomainEventWithPrimitives) => DomainEvent;

  constructor(params: {
    eventName: string;
    instanceId: string;
    eventId?: string;
    occurredOn?: DateString;
  }) {
    const { eventName, instanceId, eventId, occurredOn } = params;
    this.eventName = eventName;
    this.instanceId = instanceId;
    this.eventId = eventId || Uuid.create().value();
    this.occurredOn = occurredOn || DateValueObject.now().value();
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );

    this.logger.debug(`Domain event created`, {
      eventName: this.eventName,
      eventId: this.eventId,
      instanceId: this.instanceId,
      occurredOn: this.occurredOn,
    });
  }

  public toPrimitives(): DomainEventWithPrimitives {
    const primitives = {
      instanceId: this.instanceId,
      eventName: this.eventName,
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventData: this.getEventDataWithPrimitives(),
    };

    this.logger.debug(`Converting domain event to primitives`, primitives);
    return primitives;
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }

  abstract getEventDataWithPrimitives(): EventDataWithPrimitives;
}
