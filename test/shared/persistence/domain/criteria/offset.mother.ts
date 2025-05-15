import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { Offset } from '../../../../../src/shared/persistence/domain/criteria/offset';

export class OffsetMother {
  public static random(): Offset {
    const randomizer = RandomizerStore.get();
    return new Offset(randomizer.integer());
  }
}
