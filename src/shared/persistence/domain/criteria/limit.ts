import { NumberValueObject } from '../../../core/domain/value-object/number.value.object';

export class Limit extends NumberValueObject {
  public static default(): Limit {
    return new Limit(100);
  }
}
