import { Logger } from '../domain/ports/logger';
import { LoggerContext } from '../domain/value-objects/logger.context';
import { NestLogger } from './nest/nest.logger';

export class LoggerFactory {
  public static create(contextName: LoggerContext): Logger {
    return new NestLogger(contextName);
  }
}
