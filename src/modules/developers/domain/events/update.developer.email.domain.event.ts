import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class UpdateDeveloperEmailDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'developer.updated.email';
  readonly email: string;
  readonly oldEmail: string;

  constructor(
    developerId: string,
    email: string,
    oldEmail: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: developerId,
      eventName: UpdateDeveloperEmailDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.email = email;
    this.oldEmail = oldEmail;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      email: this.email,
      oldEmail: this.oldEmail,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): UpdateDeveloperEmailDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new UpdateDeveloperEmailDomainEvent(
      instanceId,
      eventData.email,
      eventData.oldEmail,
      eventId,
      occurredOn,
    );
  }
}
