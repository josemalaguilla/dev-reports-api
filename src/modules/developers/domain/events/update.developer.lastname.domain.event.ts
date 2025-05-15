import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class UpdateDeveloperLastNameDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'developer.updated.lastName';
  readonly lastName: string;
  readonly oldLastName: string;

  constructor(
    developerId: string,
    lastName: string,
    oldLastName: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: developerId,
      eventName: UpdateDeveloperLastNameDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.lastName = lastName;
    this.oldLastName = oldLastName;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      lastName: this.lastName,
      oldLastName: this.oldLastName,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): UpdateDeveloperLastNameDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new UpdateDeveloperLastNameDomainEvent(
      instanceId,
      eventData.lastName,
      eventData.oldLastName,
      eventId,
      occurredOn,
    );
  }
}
