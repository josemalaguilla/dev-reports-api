import { InvalidArgumentError } from '../errors/invalid-argument.error';
import { BaseValueObject } from './base.value.object';

export abstract class NumberValueObject extends BaseValueObject<number> {
  constructor(value: number) {
    super(value);
    this.ensureValueIsNumber(value);
  }

  private ensureValueIsNumber(value: number): void {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      this.logger.error(`Invalid number value`, { value });
      throw new InvalidArgumentError(`Value must be a number. Found: ${value}`);
    }
  }
}
