import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { DeveloperName } from '../../../../../src/modules/developers/domain/value-objects/developer.name';

export class DeveloperNameMother {
  public static random(): DeveloperName {
    const randomizer = RandomizerStore.get();
    return new DeveloperName(randomizer.firstName());
  }
}
