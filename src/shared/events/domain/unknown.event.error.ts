import { ApplicationError } from 'src/shared/core/domain/errors/application.error';

export class UnknownEventError extends ApplicationError {
  constructor(eventName: string) {
    super();
    this.message = `Event with name ${eventName} is not known in the application`;
  }
}
