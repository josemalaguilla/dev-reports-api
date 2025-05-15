import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { ValueObject } from 'src/shared/core/domain/value-object/value.object';

export interface ReportTargetIdPrimitives {
  developerId?: string;
}

export class ReportTargetId
  implements ValueObject<ReportTargetIdPrimitives>, Printable
{
  private readonly _developerId: DeveloperId;

  constructor(value: ReportTargetIdPrimitives) {
    this.ensureIsValid(value);
    this._developerId = new DeveloperId(value.developerId);
  }

  private ensureIsValid(value: ReportTargetIdPrimitives): void {
    if (!value) {
      throw new InvalidArgumentError(
        'Report target id cannot be null or undefined',
      );
    }

    if (Object.keys(value).length <= 0) {
      throw new InvalidArgumentError(
        'Report target id must contain at least one ID',
      );
    }
  }

  public value(): ReportTargetIdPrimitives {
    return {
      developerId: this._developerId.value(),
    };
  }

  public equals(other: ReportTargetId): boolean {
    if (!(other instanceof ReportTargetId)) {
      return false;
    }

    return this._developerId.equals(new DeveloperId(other.value().developerId));
  }

  public hasDeveloperId(): boolean {
    return !!this._developerId;
  }

  public toString(): string {
    return JSON.stringify(this.value());
  }

  public get developerId(): DeveloperId {
    return this._developerId;
  }
}
