import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';

export class GenerateReportDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'report.generated';
  readonly generatedAt: DateString;
  readonly generatedFile: string;

  constructor(
    reportId: string,
    generatedAt: DateString,
    generatedFile: string,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: reportId,
      eventName: GenerateReportDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.generatedAt = generatedAt;
    this.generatedFile = generatedFile;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      generatedAt: this.generatedAt,
      generatedFile: this.generatedFile,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): GenerateReportDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new GenerateReportDomainEvent(
      instanceId,
      eventData.generatedAt,
      eventData.generatedFile,
      eventId,
      occurredOn,
    );
  }
}
