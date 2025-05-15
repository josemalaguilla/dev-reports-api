import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class UpdateDeveloperNameDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'developer.updated.name';
  readonly name: string;
  readonly oldName: string;

  constructor(
    developerId: string,
    name: string,
    oldName: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: developerId,
      eventName: UpdateDeveloperNameDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.name = name;
    this.oldName = oldName;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      name: this.name,
      oldName: this.oldName,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): UpdateDeveloperNameDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new UpdateDeveloperNameDomainEvent(
      instanceId,
      eventData.name,
      eventData.oldName,
      eventId,
      occurredOn,
    );
  }
}
