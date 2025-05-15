import { EnumValueObject } from '../../../../shared/core/domain/value-object/enum.value.object';

export enum ReportStatuses {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export class ReportStatus extends EnumValueObject<string> {
  constructor(value: string) {
    super(value, Object.values(ReportStatuses));
  }

  public static pending(): ReportStatus {
    return new ReportStatus(ReportStatuses.PENDING);
  }

  public static processing(): ReportStatus {
    return new ReportStatus(ReportStatuses.PROCESSING);
  }

  public static completed(): ReportStatus {
    return new ReportStatus(ReportStatuses.COMPLETED);
  }

  public static failed(): ReportStatus {
    return new ReportStatus(ReportStatuses.FAILED);
  }

  public static archived(): ReportStatus {
    return new ReportStatus(ReportStatuses.ARCHIVED);
  }

  public isCompleted(): boolean {
    return this.value() === ReportStatuses.COMPLETED;
  }

  public isProcessing(): boolean {
    return this.value() === ReportStatuses.PROCESSING;
  }
}
