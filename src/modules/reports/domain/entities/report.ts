import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { Nullable } from 'src/shared/core/domain/nullable';
import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import { AggregateRoot } from '../../../../shared/core/domain/entities/aggregate.root';
import { CreateReportDomainEvent } from '../events/create.report.domain.event';
import { DeleteReportDomainEvent } from '../events/delete.report.domain.event';
import { FailedReportDomainEvent } from '../events/failed.report.domain.event';
import { GenerateReportDomainEvent } from '../events/generate.report.domain.event';
import { UpdateReportStatusDomainEvent } from '../events/update.report.status.domain.event';
import { ReportCreatedAt } from '../value-objects/report.created.at';
import { ReportDeletedAt } from '../value-objects/report.deleted.at';
import { ReportEndDate } from '../value-objects/report.end.date';
import { ReportErrorMessages } from '../value-objects/report.error.messages';
import { ReportGeneratedAt } from '../value-objects/report.generated.at';
import { ReportGeneratedFile } from '../value-objects/report.generated.file';
import { ReportId } from '../value-objects/report.id';
import { ReportStartDate } from '../value-objects/report.start.date';
import { ReportStatus } from '../value-objects/report.status';
import { ReportTarget } from '../value-objects/report.target';
import {
  ReportTargetId,
  ReportTargetIdPrimitives,
} from '../value-objects/report.target.id';

export declare type ReportWithPrimitives = {
  id: string;
  target: string;
  createdAt: DateString;
  status: string;
  targetId: ReportTargetIdPrimitives;
  startDate: DateString;
  endDate: DateString;
  generatedAt?: DateString;
  deletedAt?: DateString;
  generatedFile?: string;
  errorMessages?: string[];
};

export class Report extends AggregateRoot {
  private _id: ReportId;
  private _target: ReportTarget;
  private _createdAt: ReportCreatedAt;
  private _status: ReportStatus;
  private _targetId: ReportTargetId;
  private _startDate: ReportStartDate;
  private _endDate: ReportEndDate;
  private _generatedAt?: ReportGeneratedAt;
  private _deletedAt?: ReportDeletedAt;
  private _generatedFile?: ReportGeneratedFile;
  private _errorMessages?: ReportErrorMessages;

  constructor(
    id: ReportId,
    target: ReportTarget,
    createdAt: ReportCreatedAt,
    status: ReportStatus,
    targetId: ReportTargetId,
    startDate: ReportStartDate,
    endDate: ReportEndDate,
    generatedAt?: ReportGeneratedAt,
    deletedAt?: ReportDeletedAt,
    generatedFile?: ReportGeneratedFile,
    errorMessages?: ReportErrorMessages,
  ) {
    super();
    this._id = id;
    this._target = target;
    this._createdAt = createdAt;
    this._status = status;
    this._targetId = targetId;
    this._startDate = startDate;
    this._endDate = endDate;
    this._generatedAt = generatedAt;
    this._deletedAt = deletedAt;
    this._generatedFile = generatedFile;
    this._errorMessages = errorMessages;
    this.logger.verbose('Created report', {
      id: this.id,
      target: this.target,
      createdAt: this.createdAt,
      status: this.status,
      targetId: this.targetId,
      startDate: this.startDate,
      endDate: this.endDate,
      generatedAt: this.generatedAt,
      deletedAt: this.deletedAt,
      generatedFile: this.generatedFile,
      errorMessages: this._errorMessages,
    });
  }

  public static create(
    id: ReportId,
    target: ReportTarget,
    targetId: ReportTargetId,
    startDate: ReportStartDate,
    endDate: ReportEndDate,
  ): Report {
    const report = new Report(
      id,
      target,
      ReportCreatedAt.now(),
      ReportStatus.pending(),
      targetId,
      startDate,
      endDate,
    );
    report.record(
      new CreateReportDomainEvent(
        report.id.value(),
        report.target.value(),
        report.status.value(),
        report.targetId.value(),
        report.startDate.value(),
        report.endDate.value(),
      ),
    );
    return report;
  }

  public static fromPrimitives(entity: ReportWithPrimitives): Report {
    return new Report(
      new ReportId(entity.id),
      new ReportTarget(entity.target),
      new ReportCreatedAt(entity.createdAt),
      new ReportStatus(entity.status),
      new ReportTargetId(entity.targetId),
      new ReportStartDate(entity.startDate),
      new ReportEndDate(entity.endDate),
      entity.generatedAt && new ReportGeneratedAt(entity.generatedAt),
      entity.deletedAt && new ReportDeletedAt(entity.deletedAt),
      entity.generatedFile && new ReportGeneratedFile(entity.generatedFile),
      entity.errorMessages && new ReportErrorMessages(entity.errorMessages),
    );
  }

  public get id(): ReportId {
    return this._id;
  }
  public get target(): ReportTarget {
    return this._target;
  }
  public get createdAt(): ReportCreatedAt {
    return this._createdAt;
  }
  public get status(): ReportStatus {
    return this._status;
  }
  public get targetId(): ReportTargetId {
    return this._targetId;
  }
  public get startDate(): ReportStartDate {
    return this._startDate;
  }
  public get endDate(): ReportEndDate {
    return this._endDate;
  }
  public get generatedAt(): Nullable<ReportGeneratedAt> {
    return this._generatedAt;
  }
  public get deletedAt(): Nullable<ReportDeletedAt> {
    return this._deletedAt;
  }
  public get generatedFile(): Nullable<ReportGeneratedFile> {
    return this._generatedFile;
  }

  public get errorMessages(): Nullable<ReportErrorMessages> {
    return this._errorMessages;
  }

  public get targetDeveloperId(): Nullable<DeveloperId> {
    return this.targetId.developerId;
  }

  public getId(): string {
    return this.id.value();
  }

  public toPrimitives(): ReportWithPrimitives {
    return {
      id: this.id.value(),
      target: this.target.value(),
      createdAt: this.createdAt.value(),
      status: this.status.value(),
      targetId: this.targetId.value(),
      startDate: this.startDate.value(),
      endDate: this.endDate.value(),
      generatedAt: this.generatedAt?.value(),
      deletedAt: this.deletedAt?.value(),
      generatedFile: this.generatedFile?.value(),
      errorMessages: this.errorMessages?.value(),
    };
  }

  public equals(otherReport: Report): boolean {
    const areErrorMessageEquals =
      (!this.errorMessages && !otherReport.errorMessages) ||
      (this.errorMessages &&
        otherReport.errorMessages &&
        this.errorMessages.equals(otherReport.errorMessages));
    const isEquals =
      this.id.equals(otherReport.id) &&
      this.target.equals(otherReport.target) &&
      this.createdAt.equals(otherReport.createdAt) &&
      this.status.equals(otherReport.status) &&
      this.targetId.equals(otherReport.targetId) &&
      this.startDate.equals(otherReport.startDate) &&
      this.endDate.equals(otherReport.endDate) &&
      this.optionalFieldsAreEquals(this.generatedAt, otherReport.generatedAt) &&
      this.optionalFieldsAreEquals(this.deletedAt, otherReport.deletedAt) &&
      this.optionalFieldsAreEquals(
        this.generatedFile,
        otherReport.generatedFile,
      ) &&
      areErrorMessageEquals;
    this.logger.verbose('Comparing reports', {
      id: this.id,
      otherId: otherReport.id,
      isEquals,
    });
    return isEquals;
  }

  public markAsGenerated(filePath: ReportGeneratedFile): void {
    this.logger.debug('Marking report as generated', {
      id: this.id,
      filePath,
    });
    this._generatedAt = ReportGeneratedAt.now();
    const oldStatus = this._status;
    this._status = ReportStatus.completed();
    this._generatedFile = filePath;
    this.record(
      new GenerateReportDomainEvent(
        this.id.value(),
        this.generatedAt.value(),
        this.generatedFile.value(),
      ),
    );
    this.record(
      new UpdateReportStatusDomainEvent(
        this.id.value(),
        this.status.value(),
        oldStatus.value(),
      ),
    );
  }

  public markAsFailed(errorMessages: ReportErrorMessages): void {
    this.logger.debug('Marking report as failed', {
      id: this.id,
      errorMessages: errorMessages,
    });
    this._generatedAt = ReportGeneratedAt.now();
    const oldStatus = this._status;
    this._status = ReportStatus.failed();
    this._errorMessages = errorMessages;
    this.record(
      new FailedReportDomainEvent(
        this.id.value(),
        this.generatedAt.value(),
        this._errorMessages.value(),
      ),
    );
    this.record(
      new UpdateReportStatusDomainEvent(
        this.id.value(),
        this.status.value(),
        oldStatus.value(),
      ),
    );
  }

  public markAsProcessing(): void {
    this.logger.debug('Marking report as processing', {
      id: this.id.value(),
    });
    const oldStatus = this._status;
    this._status = ReportStatus.processing();
    this.record(
      new UpdateReportStatusDomainEvent(
        this.id.value(),
        this.status.value(),
        oldStatus.value(),
      ),
    );
  }

  public delete(): void {
    this.logger.debug('Deleting report', { id: this.id });
    this._deletedAt = ReportDeletedAt.now();
    const oldStatus = this._status;
    this._status = ReportStatus.archived();
    this.record(
      new DeleteReportDomainEvent(this.id.value(), this.deletedAt.value()),
    );
    this.record(
      new UpdateReportStatusDomainEvent(
        this.id.value(),
        this.status.value(),
        oldStatus.value(),
      ),
    );
  }

  public isCompleted(): boolean {
    return this._status.isCompleted();
  }

  public isProcessing(): boolean {
    return this._status.isProcessing();
  }
}
