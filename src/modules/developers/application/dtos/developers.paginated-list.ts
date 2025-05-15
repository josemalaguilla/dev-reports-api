import {
  Developer,
  DeveloperWithPrimitives,
} from '../../domain/entities/developer';

export class DevelopersPaginatedList {
  public readonly items: DeveloperWithPrimitives[];

  constructor(
    items: Developer[],
    public readonly total: number,
  ) {
    this.items = items.map((item) => item.toPrimitives());
  }
}
