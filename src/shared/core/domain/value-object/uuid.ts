import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { BaseValueObject } from './base.value.object';

export class Uuid extends BaseValueObject<string> {
  constructor(value: string) {
    super(value);
    this.ensureIsValidUuid(value);
  }

  public static create(): Uuid {
    return new Uuid(uuidv4());
  }

  private ensureIsValidUuid(uuid: string): void {
    if (!uuidValidate(uuid)) {
      this.logger.error(`The uuid is not valid`, { uuid });
      throw new InvalidArgumentError(`The uuid ${uuid} is not valid`);
    }
  }
}
