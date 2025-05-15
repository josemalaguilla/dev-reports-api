import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { Report } from 'src/modules/reports/domain/entities/report';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { ValueObject } from 'src/shared/core/domain/value-object/value.object';

export declare interface ReportGenerationParamsWithPrimitives {
  developerId: string;
}

export class ReportGenerationParams
  implements ValueObject<ReportGenerationParamsWithPrimitives>, Printable
{
  private readonly _developerId: DeveloperId;

  constructor(developerId: string) {
    this.ensureDeveloperIdIsValid(developerId);
    this._developerId = new DeveloperId(developerId);
  }

  private ensureDeveloperIdIsValid(developerId: string): void {
    if (!developerId) {
      throw new InvalidArgumentError(
        `Developer id is a required param of report generation params. Received ${developerId}`,
      );
    }
  }

  public static fromReport(report: Report) {
    return new ReportGenerationParams(report.targetDeveloperId?.value());
  }

  public value(): ReportGenerationParamsWithPrimitives {
    return {
      developerId: this._developerId.value(),
    };
  }

  public get developerId(): DeveloperId {
    return this._developerId;
  }

  public equals(otherParams: ReportGenerationParams): boolean {
    return this._developerId.equals(otherParams.developerId);
  }

  public toString(): string {
    return JSON.stringify(this.value());
  }
}
