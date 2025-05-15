import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { LoggerContext } from '../value-objects/logger.context';

export enum LoggingClassTypes {
  useCase = 'useCase',
  rest = 'rest',
  entities = 'entities',
  services = 'services',
  infraestructure = 'infraestructure',
  errors = 'errors',
}

export class LoggerContextBuilder {
  private context: string;

  public withModule(module: LoggingSymbols): LoggerContextBuilder {
    this.appendValue(module);
    return this;
  }

  public withClassType(classType: LoggingClassTypes): LoggerContextBuilder {
    this.appendValue(classType);
    return this;
  }

  public withClassName(className: string): LoggerContextBuilder {
    this.appendValue(className);
    return this;
  }

  private appendValue(value: string): void {
    this.context = this.context ? `${this.context}.${value}` : value;
  }

  public build(): LoggerContext {
    return new LoggerContext(this.context || '');
  }
}
