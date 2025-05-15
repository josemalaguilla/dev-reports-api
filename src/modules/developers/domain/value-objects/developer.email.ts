import { InvalidArgumentError } from '../../../../shared/core/domain/errors/invalid-argument.error';
import { StringValueObject } from '../../../../shared/core/domain/value-object/string.value.object';

export class DeveloperEmail extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValidEmail(value);
  }

  private ensureIsValidEmail(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.logger.error('Invalid email format', { email: value });
      throw new InvalidArgumentError(`Invalid email address: ${value}`);
    }
  }
}
