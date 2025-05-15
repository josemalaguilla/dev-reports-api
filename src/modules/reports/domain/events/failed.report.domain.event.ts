import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class FailedReportDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'report.failed';
  readonly generatedAt: DateString;
  readonly errorMessages: string[];

  constructor(
    reportId: string,
    generatedAt: DateString,
    errorMessages: string[],
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: reportId,
      eventName: FailedReportDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.generatedAt = generatedAt;
    this.errorMessages = errorMessages;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      generatedAt: this.generatedAt,
      errorMessages: this.errorMessages,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): FailedReportDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new FailedReportDomainEvent(
      instanceId,
      eventData.generatedAt,
      eventData.errorMessages,
      eventId,
      occurredOn,
    );
  }
}
