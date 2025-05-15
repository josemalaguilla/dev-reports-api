import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { DeveloperLastName } from '../../../../../src/modules/developers/domain/value-objects/developer.last.name';

export class DeveloperLastNameMother {
  public static random(): DeveloperLastName {
    const randomizer = RandomizerStore.get();
    return new DeveloperLastName(randomizer.lastName());
  }
}
