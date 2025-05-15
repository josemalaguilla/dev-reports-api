import { Randomizer } from '../domain/randomizer';
import { RandomizerSeed } from '../domain/randomizer.seed';
import { FakerRandomizer } from './faker/faker.randomizer';

export class RandomizerStore {
  private static instance: Randomizer;

  public static get(): Randomizer {
    if (!this.instance) {
      this.instance = new FakerRandomizer(RandomizerSeed.byDate());
    }
    return this.instance;
  }
}
