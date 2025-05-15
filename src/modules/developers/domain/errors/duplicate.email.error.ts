import { ApplicationError } from '../../../../shared/core/domain/errors/application.error';
import { DeveloperEmail } from '../value-objects/developer.email';

export class DuplicateEmailError extends ApplicationError {
  constructor(email: DeveloperEmail) {
    super();
    this.message = `Already exists an instance for the given email ${email.value()}`;
  }
}
