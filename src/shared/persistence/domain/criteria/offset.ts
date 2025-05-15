import { NumberValueObject } from '../../../core/domain/value-object/number.value.object';

export class Offset extends NumberValueObject {
  public static zero() {
    return new Offset(0);
  }
}
