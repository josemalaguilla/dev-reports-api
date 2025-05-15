import { Report, ReportWithPrimitives } from '../../domain/entities/report';

export class ReportsPaginatedList {
  public readonly items: ReportWithPrimitives[];

  constructor(
    items: Report[],
    public readonly total: number,
  ) {
    this.items = items.map((item) => item.toPrimitives());
  }
}
