import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportStatus } from '../../domain/value-objects/report.status';
import { ReportTarget } from '../../domain/value-objects/report.target';

export declare type ReportFilterQueryWithPrimitives = {
  target?: string;
  status?: string;
  developerId?: string;
};

export class ReportFilterQuery {
  constructor(
    public readonly target?: ReportTarget,
    public readonly status?: ReportStatus,
    public readonly developerId?: DeveloperId,
  ) {}

  public toPrimitives(): ReportFilterQueryWithPrimitives {
    const primitives: ReportFilterQueryWithPrimitives = {};
    if (this.target) {
      primitives.target = this.target.value();
    }
    if (this.status) {
      primitives.status = this.status.value();
    }
    if (this.developerId) {
      primitives.developerId = this.developerId.value();
    }
    return primitives;
  }
}
