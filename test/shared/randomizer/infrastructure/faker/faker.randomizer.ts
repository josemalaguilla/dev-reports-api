import { faker } from '@faker-js/faker/.';
import { Randomizer } from 'test/shared/randomizer/domain/randomizer';
import { RandomizerSeed } from 'test/shared/randomizer/domain/randomizer.seed';

export class FakerRandomizer extends Randomizer {
  constructor(seed: RandomizerSeed) {
    super(seed);
    faker.seed(seed.value());
  }

  public integer(min?: number, max?: number): number {
    const value = faker.number.int({ min, max });
    this.logger.verbose('Generated random integer', { min, max, value });
    return value;
  }

  public date(): Date {
    const value = faker.date.anytime();
    this.logger.verbose('Generated random date', { value });
    return value;
  }

  public email(): string {
    const value = faker.internet.email();
    this.logger.verbose('Generated random email', { value });
    return value;
  }

  public alphaString(): string {
    const value = faker.string.alpha();
    this.logger.verbose('Generated random alpha string', { value });
    return value;
  }

  public firstName(): string {
    const value = faker.person.firstName();
    this.logger.verbose('Generated random first name', { value });
    return value;
  }

  public lastName(): string {
    const value = faker.person.lastName();
    this.logger.verbose('Generated random last name', { value });
    return value;
  }

  public fileName(): string {
    const value = faker.system.fileName();
    this.logger.verbose('Generated random fileName', { value });
    return value;
  }

  public fileExtension(): string {
    const value = faker.system.fileExt();
    this.logger.verbose('Generated random fileExtension', { value });
    return value;
  }
}
