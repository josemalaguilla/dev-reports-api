import { EnumValueObject } from '../../../core/domain/value-object/enum.value.object';

export enum OrderTypes {
  ASC = 'asc',
  DESC = 'desc',
}

export class OrderType extends EnumValueObject<OrderTypes> {
  constructor(value: OrderTypes) {
    super(value, Object.values(OrderTypes));
  }

  public static asc(): OrderType {
    return new OrderType(OrderTypes.ASC);
  }

  public static desc(): OrderType {
    return new OrderType(OrderTypes.DESC);
  }

  public isAsc(): boolean {
    const isAsc = this.value() === OrderTypes.ASC;
    this.logger.verbose(`Checking if order type is ascending`, { isAsc });
    return isAsc;
  }
}
