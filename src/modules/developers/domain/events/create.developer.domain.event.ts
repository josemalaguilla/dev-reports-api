import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class CreateDeveloperDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'developer.created';
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly status: string;

  constructor(
    developerId: string,
    name: string,
    email: string,
    status: string,
    lastName?: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: developerId,
      eventName: CreateDeveloperDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.status = status;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      status: this.status,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): CreateDeveloperDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new CreateDeveloperDomainEvent(
      instanceId,
      eventData.name,
      eventData.email,
      eventData.status,
      eventData.lastName,
      eventId,
      occurredOn,
    );
  }
}
