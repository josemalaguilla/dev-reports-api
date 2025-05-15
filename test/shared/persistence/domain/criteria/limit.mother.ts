import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { Limit } from '../../../../../src/shared/persistence/domain/criteria/limit';

export class LimitMother {
  public static random(): Limit {
    const randomizer = RandomizerStore.get();
    return new Limit(randomizer.integer());
  }
}
