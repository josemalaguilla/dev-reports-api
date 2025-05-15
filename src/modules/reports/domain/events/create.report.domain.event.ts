import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import {
  DomainEvent,
  DomainEventWithPrimitives,
  EventDataWithPrimitives,
} from 'src/shared/events/domain/domain.event';
import { ReportTargetIdPrimitives } from '../value-objects/report.target.id';

export class CreateReportDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'report.created';
  readonly target: string;
  readonly status: string;
  readonly targetId: ReportTargetIdPrimitives;
  readonly startDate: DateString;
  readonly endDate: DateString;

  constructor(
    reportId: string,
    target: string,
    status: string,
    targetId: ReportTargetIdPrimitives,
    startDate: DateString,
    endDate: DateString,
    eventId?: string,
    occurredOn?: DateString,
  ) {
    super({
      instanceId: reportId,
      eventName: CreateReportDomainEvent.EVENT_NAME,
      eventId,
      occurredOn,
    });
    this.target = target;
    this.status = status;
    this.targetId = targetId;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public getEventDataWithPrimitives(): EventDataWithPrimitives {
    return {
      target: this.target,
      status: this.status,
      targetId: this.targetId,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  static fromPrimitives(
    event: DomainEventWithPrimitives,
  ): CreateReportDomainEvent {
    const { instanceId, eventId, occurredOn, eventData } = event;

    return new CreateReportDomainEvent(
      instanceId,
      eventData.target,
      eventData.status,
      eventData.targetId,
      eventData.startDate,
      eventData.endDate,
      eventId,
      occurredOn,
    );
  }
}
