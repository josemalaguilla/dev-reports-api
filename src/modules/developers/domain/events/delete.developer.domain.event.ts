import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class DeleteDeveloperDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'developer.deleted';
  readonly deletedAt: string;

  constructor(
    developerId: string,
    deletedAt: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: developerId,
      eventName: DeleteDeveloperDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.deletedAt = deletedAt;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      deletedAt: this.deletedAt,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): DeleteDeveloperDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new DeleteDeveloperDomainEvent(
      instanceId,
      eventData.deletedAt,
      eventId,
      occurredOn,
    );
  }
}
