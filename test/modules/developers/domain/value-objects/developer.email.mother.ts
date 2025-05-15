import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { DeveloperEmail } from '../../../../../src/modules/developers/domain/value-objects/developer.email';

export class DeveloperEmailMother {
  public static random(): DeveloperEmail {
    const randomizer = RandomizerStore.get();
    return new DeveloperEmail(randomizer.email());
  }
}
