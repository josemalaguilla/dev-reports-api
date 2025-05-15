import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class UpdateReportStatusDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'report.status.updated';
  readonly status: string;
  readonly oldStatus: string;

  constructor(
    reportId: string,
    status: string,
    oldStatus: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: reportId,
      eventName: UpdateReportStatusDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.status = status;
    this.oldStatus = oldStatus;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      status: this.status,
      oldStatus: this.oldStatus,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): UpdateReportStatusDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new UpdateReportStatusDomainEvent(
      instanceId,
      eventData.status,
      eventData.oldStatus,
      eventId,
      occurredOn,
    );
  }
}
