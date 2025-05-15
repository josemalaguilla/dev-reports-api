import { Logger as NestJSLogger } from '@nestjs/common';
import { Logger } from '../../domain/ports/logger';
import { LoggerContext } from '../../domain/value-objects/logger.context';

export class NestLogger implements Logger {
  private readonly logger: NestJSLogger;

  constructor(private readonly context: LoggerContext) {
    this.logger = new NestJSLogger(context.value());
  }

  public log(message: string, ...optionalParams: any[]): void {
    if (!this.context.areLogsEnabled()) return;
    this.logger.log(
      message,
      ...this.convertParamsIntoPrimitives(optionalParams),
    );
  }

  public error(message: string, ...optionalParams: any[]): void {
    if (!this.context.areLogsEnabled()) return;
    this.logger.error(
      message,
      ...this.convertParamsIntoPrimitives(optionalParams),
    );
  }

  public warn(message: string, ...optionalParams: any[]): void {
    if (!this.context.areLogsEnabled()) return;
    this.logger.warn(
      message,
      ...this.convertParamsIntoPrimitives(optionalParams),
    );
  }

  public debug(message: string, ...optionalParams: any[]): void {
    if (!this.context.areLogsEnabled()) return;
    this.logger.debug(
      message,
      ...this.convertParamsIntoPrimitives(optionalParams),
    );
  }

  public verbose(message: string, ...optionalParams: any[]): void {
    if (!this.context.areLogsEnabled()) return;
    this.logger.verbose(
      message,
      ...this.convertParamsIntoPrimitives(optionalParams),
    );
  }

  private convertParamsIntoPrimitives(optionalParams: any[]): any[] {
    return optionalParams.map((param) => {
      if (
        !this.isPrintable(param) &&
        typeof param === 'object' &&
        Object.keys(param).length > 0
      ) {
        return this.convertObjectIntoPrintable(param);
      }
      return this.convertValueIntoPrintable(param);
    });
  }

  private convertObjectIntoPrintable(object: object): object {
    const parsedParams = {};
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key];
        parsedParams[key] = this.convertValueIntoPrintable(value);
      }
    }
    return parsedParams;
  }

  private convertValueIntoPrintable(value: any): any {
    if (this.isPrintable(value)) {
      return value.toString();
    }
    return value;
  }

  private isPrintable(value: any): boolean {
    return (
      value &&
      typeof value.toString === 'function' &&
      value.toString !== Object.prototype.toString
    );
  }
}
