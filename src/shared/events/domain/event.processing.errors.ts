import { ApplicationError } from 'src/shared/core/domain/errors/application.error';
import { EventProcessingError } from './event.processing.error';

export class EventProcessingErrors extends ApplicationError {
  constructor(public readonly errors: EventProcessingError[]) {
    super();
    this.message = `Error during event processing: ${this.getErrorsSummary()}`;
  }

  private getErrorsSummary() {
    return this.errors
      .map((error) => `${error.subscriber} - ${error.message}`)
      .join(', ');
  }
}
