import { NumberValueObject } from '../../../../src/shared/core/domain/value-object/number.value.object';

export class RandomizerSeed extends NumberValueObject {
  public static byDate(): RandomizerSeed {
    const today = new Date(Date.now());
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    return new RandomizerSeed(seed);
  }
}
