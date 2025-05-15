import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class DeleteReportDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'report.deleted';
  readonly deletedAt: DateString;

  constructor(
    reportId: string,
    deletedAt: DateString,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: reportId,
      eventName: DeleteReportDomainEvent.EVENT_NAME,
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
  ): DeleteReportDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new DeleteReportDomainEvent(
      instanceId,
      eventData.deletedAt,
      eventId,
      occurredOn,
    );
  }
}
