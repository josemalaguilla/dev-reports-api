import { ApplicationError } from './application.error';

export class InvalidArgumentError extends ApplicationError {
  constructor(message: string) {
    super();
    this.message = message;
  }
}
