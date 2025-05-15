import { ApplicationError } from '../../../../shared/core/domain/errors/application.error';
import { DeveloperId } from '../value-objects/developer.id';

export class DeveloperNotFoundError extends ApplicationError {
  constructor(id: DeveloperId) {
    super();
    this.message = `Developer with id ${id.value()} not found`;
  }
}
